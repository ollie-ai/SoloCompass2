import express from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../db.js';
import logger from '../services/logger.js';
import { broadcastToUser } from '../services/websocket.js';

const router = express.Router();
router.use(authenticate);

// Get incoming pending calls for current user
router.get('/incoming', async (req, res) => {
  try {
    const userId = req.userId;
    
    const calls = await db.prepare(`
      SELECT 
        bc.id,
        bc.caller_id as "callerId",
        bc.receiver_id as "receiverId",
        bc.conversation_id as "conversationId",
        bc.call_type as "callType",
        bc.status,
        bc.created_at as "createdAt",
        caller.name as "callerName"
      FROM buddy_calls bc
      JOIN users caller ON bc.caller_id = caller.id
      WHERE bc.receiver_id = ? AND bc.status = 'pending'
      AND bc.created_at > NOW() - INTERVAL '30 seconds'
      ORDER BY bc.created_at DESC
    `).all(userId);

    res.json({ success: true, data: calls });
  } catch (error) {
    logger.error(`[Calls] Failed to get incoming: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get incoming calls' }
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { receiverId, conversationId, callType = 'video' } = req.body;
    const callerId = req.userId;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELD', message: 'receiverId is required' }
      });
    }

    if (receiverId === callerId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Cannot call yourself' }
      });
    }

    if (!['video', 'audio'].includes(callType)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CALL_TYPE', message: 'callType must be video or audio' }
      });
    }

    const receiver = await db.prepare(`
      SELECT id FROM users WHERE id = ?
    `).get(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Receiver not found' }
      });
    }

    const existingPending = await db.prepare(`
      SELECT id FROM buddy_calls 
      WHERE caller_id = ? AND receiver_id = ? AND status = 'pending'
      AND created_at > NOW() - INTERVAL '5 minutes'
    `).get(callerId, receiverId);

    if (existingPending) {
      return res.status(409).json({
        success: false,
        error: { code: 'CALL_EXISTS', message: 'A pending call already exists' }
      });
    }

    const result = await db.prepare(`
      INSERT INTO buddy_calls (caller_id, receiver_id, conversation_id, call_type, status)
      VALUES (?, ?, ?, ?, 'pending')
      RETURNING id, caller_id as "callerId", receiver_id as "receiverId", 
                conversation_id as "conversationId", call_type as "callType", 
                status, created_at as "createdAt"
    `).run(callerId, receiverId, conversationId || null, callType);

    const call = result.rows[0];

    broadcastToUser(receiverId, {
      type: 'call_invite',
      call: {
        id: call.id,
        callerId: call.callerId,
        callType: call.callType,
        conversationId: call.conversationId,
        createdAt: call.createdAt
      }
    });

    res.json({ success: true, data: call });
  } catch (error) {
    logger.error(`[Calls] Failed to initiate call: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to initiate call' }
    });
  }
});

router.get('/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.userId;

    const call = await db.prepare(`
      SELECT 
        bc.id,
        bc.caller_id as "callerId",
        bc.receiver_id as "receiverId",
        bc.conversation_id as "conversationId",
        bc.call_type as "callType",
        bc.status,
        bc.started_at as "startedAt",
        bc.ended_at as "endedAt",
        bc.created_at as "createdAt",
        caller.name as "callerName",
        caller.email as "callerEmail",
        receiver.name as "receiverName",
        receiver.email as "receiverEmail"
      FROM buddy_calls bc
      JOIN users caller ON bc.caller_id = caller.id
      JOIN users receiver ON bc.receiver_id = receiver.id
      WHERE bc.id = ?
    `).get(callId);

    if (!call) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Call not found' }
      });
    }

    if (call.callerId !== userId && call.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a participant in this call' }
      });
    }

    res.json({ success: true, data: call });
  } catch (error) {
    logger.error(`[Calls] Failed to get call: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get call details' }
    });
  }
});

router.put('/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!['accepted', 'declined', 'ended', 'missed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Status must be accepted, declined, ended, or missed' }
      });
    }

    const call = await db.prepare(`
      SELECT * FROM buddy_calls WHERE id = ?
    `).get(callId);

    if (!call) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Call not found' }
      });
    }

    if (call.caller_id !== userId && call.receiver_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a participant in this call' }
      });
    }

    if (call.status !== 'pending' && status === 'accepted') {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_PROCESSED', message: 'Call has already been processed' }
      });
    }

    const otherUserId = call.caller_id === userId ? call.receiver_id : call.caller_id;

    let updateData = { status };
    if (status === 'accepted') {
      updateData.started_at = new Date().toISOString();
    } else if (['ended', 'declined', 'missed'].includes(status)) {
      updateData.ended_at = new Date().toISOString();
      if (status === 'accepted') {
        updateData.started_at = new Date().toISOString();
      }
    }

    await db.prepare(`
      UPDATE buddy_calls 
      SET status = ?,
          started_at = COALESCE(?, started_at),
          ended_at = COALESCE(?, ended_at)
      WHERE id = ?
    `).run(
      status,
      status === 'accepted' ? updateData.started_at : null,
      ['ended', 'declined', 'missed'].includes(status) ? updateData.ended_at : null,
      callId
    );

    const wsStatus = status === 'accepted' ? 'call_accept' 
                   : status === 'declined' ? 'call_decline'
                   : 'call_end';

    broadcastToUser(otherUserId, {
      type: wsStatus,
      callId: parseInt(callId),
      userId: userId
    });

    const updatedCall = await db.prepare(`
      SELECT 
        id,
        caller_id as "callerId",
        receiver_id as "receiverId",
        conversation_id as "conversationId",
        call_type as "callType",
        status,
        started_at as "startedAt",
        ended_at as "endedAt",
        created_at as "createdAt"
      FROM buddy_calls WHERE id = ?
    `).get(callId);

    res.json({ success: true, data: updatedCall });
  } catch (error) {
    logger.error(`[Calls] Failed to update call: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update call' }
    });
  }
});

router.post('/:callId/join', async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.userId;

    const call = await db.prepare(`
      SELECT * FROM buddy_calls WHERE id = ?
    `).get(callId);

    if (!call) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Call not found' }
      });
    }

    if (call.caller_id !== userId && call.receiver_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a participant in this call' }
      });
    }

    if (call.status !== 'accepted') {
      return res.status(409).json({
        success: false,
        error: { code: 'CALL_NOT_ACTIVE', message: 'Call is not active' }
      });
    }

    const token = Buffer.from(JSON.stringify({
      callId: call.id,
      userId: userId,
      callType: call.call_type,
      exp: Date.now() + 3600000
    })).toString('base64');

    res.json({ 
      success: true, 
      data: {
        callId: call.id,
        userId: userId,
        callType: call.call_type,
        token: token,
        roomId: `call_${call.id}`
      }
    });
  } catch (error) {
    logger.error(`[Calls] Failed to join call: ${error.message}`);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to join call' }
    });
  }
});

export default router;
