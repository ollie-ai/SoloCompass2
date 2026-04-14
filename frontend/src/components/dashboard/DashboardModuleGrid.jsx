import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Standardized key extraction to avoid fragile regex issues.
 */
const getWidgetKey = (child) => {
    if (!child || !child.key) return null;
    return String(child.key).replace(/^\.\$/, '').replace(/^[\s\S]*?:/, '');
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

/**
 * SortableWrapper - wraps a widget to make it sortable via dnd-kit
 */
export function SortableWidget({ id, children, draggable = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled: !draggable });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    // If draggable, wrap children with drag handle listeners
    if (draggable) {
        return (
            <div ref={setNodeRef} style={style} {...attributes}>
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            dragHandleProps: { ...listeners, ...attributes },
                            draggable: true,
                        });
                    }
                    return child;
                })}
            </div>
        );
    }

    // If not draggable, just render children normally
    return <div ref={setNodeRef} style={style}>{children}</div>;
}

const DashboardModuleGrid = ({ 
    children, 
    columns = 2, 
    className = "", 
    widgetStates = {},
    setWidgetState,
    onReorder,
    orderedKeys = [],
    draggable = false,
}) => {
    const [activeId, setActiveId] = useState(null);

    // Setup dnd-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Get all widget keys from children
    const allWidgetKeys = useMemo(() => {
        if (!children) return [];
        return React.Children.toArray(children)
            .map(child => getWidgetKey(child))
            .filter(Boolean);
    }, [children]);

    // Use orderedKeys if provided, otherwise use allWidgetKeys
    const displayOrder = orderedKeys.length > 0 
        ? orderedKeys.filter(key => allWidgetKeys.includes(key))
        : allWidgetKeys;

    // Filter out hidden widgets
    const visibleKeys = useMemo(() => {
        return displayOrder.filter(key => {
            const state = widgetStates[key];
            return !state || !state.hidden;
        });
    }, [displayOrder, widgetStates]);

    // Map children to ordered array
    const orderedChildren = useMemo(() => {
        if (!children) return [];
        const childArray = React.Children.toArray(children);
        
        // Create a map of key -> child
        const childMap = {};
        childArray.forEach(child => {
            const key = getWidgetKey(child);
            if (key) childMap[key] = child;
        });

        // Return ordered array based on visibleKeys
        return visibleKeys.map(key => childMap[key]).filter(Boolean);
    }, [children, visibleKeys]);

    const colClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    };

    // Handle drag end
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const oldIndex = displayOrder.indexOf(active.id);
        const newIndex = displayOrder.indexOf(over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(displayOrder, oldIndex, newIndex);
            onReorder?.(newOrder);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    // Find the active widget for drag overlay
    const activeWidget = useMemo(() => {
        if (!activeId || !children) return null;
        const childArray = React.Children.toArray(children);
        return childArray.find(child => getWidgetKey(child) === activeId);
    }, [activeId, children]);

    return (
        <div className="w-full">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <SortableContext 
                    items={visibleKeys} 
                    strategy={rectSortingStrategy}
                >
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className={`grid gap-4 sm:gap-6 items-start ${colClasses[columns] || colClasses[2]} ${className}`}
                        style={{ minHeight: '200px' }}
                    >
                        {orderedChildren.map((child, index) => {
                            const key = getWidgetKey(child);
                            return (
                                <SortableWidget 
                                    key={key} 
                                    id={key}
                                    draggable={draggable}
                                >
                                    {child}
                                </SortableWidget>
                            );
                        })}
                    </motion.div>
                </SortableContext>

                {/* Drag Overlay for visual feedback */}
                <DragOverlay>
                    {activeWidget ? (
                        <div className="opacity-90 scale-105 shadow-2xl">
                            {activeWidget}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export const ModuleCard = ({ children, className = "", hover = false, accentColor, size = "default", variant = "default" }) => {
    const accentBorder = accentColor ? {
        emerald: 'border-t-2 border-t-brand-vibrant/40',
        amber: 'border-t-2 border-t-amber-400/40',
        violet: 'border-t-2 border-t-brand-accent/40',
        blue: 'border-t-2 border-t-sky-400/40',
        red: 'border-t-2 border-t-red-400/40',
        sky: 'border-t-2 border-t-sky-400/40',
    }[accentColor] || '' : '';

    const sizeClasses = {
        default: "p-5 min-h-[140px]",
        large: "p-8 min-h-[180px]",
    };

    const variantClasses = {
        default: "glass-card !bg-base-100/70 backdrop-blur-xl rounded-2xl border border-base-content/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] h-full w-full",
        premium: "bg-base-100/90 backdrop-blur-xl rounded-2xl border border-base-300/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] h-full w-full",
        gradient: "bg-gradient-to-br from-brand-vibrant/5 to-brand-accent/5 border-brand-vibrant/20 rounded-2xl border border-brand-vibrant/20 h-full w-full",
    };

    return (
        <div className={`${variantClasses[variant]} ${sizeClasses[size]} ${accentBorder} transition-all duration-500 ${className}`}>
            {children}
        </div>
    );
};

export default DashboardModuleGrid;