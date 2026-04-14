import { useState } from 'react';
import { motion } from 'framer-motion';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, HelpCircle, Shield } from 'lucide-react';

const faqs = [
  {
    question: 'What does the demo include?',
    answer: 'The demo lets you preview what SoloCompass generates — a sample itinerary plus an example of the safety layer — without creating an account.'
  },
  {
    question: 'Is SoloCompass free to try?',
    answer: 'Yes. Explorer includes your Travel DNA profile and 1 AI itinerary per month so you can test the workflow without subscribing.'
  },
  {
    question: 'How do check-ins work?',
    answer: 'You can schedule check-ins during a trip. If you miss a check-in, SoloCompass escalates in steps: first a reminder, then a grace period, then alerts to your chosen emergency contacts (email/SMS). You stay in control of who gets alerted, and you can cancel escalation if you\'re safe.'
  },
  {
    question: 'Does SoloCompass guarantee safety?',
    answer: 'No. SoloCompass provides planning tools and safety workflows, but it cannot guarantee outcomes. Always follow local laws and official advice.'
  },
  {
    question: 'What sources do you use for advisories?',
    answer: 'SoloCompass surfaces official travel advisories (FCDO) and other practical signals where available.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. You can manage or cancel your subscription from your account settings.'
  },
  {
    question: 'What happens to my data if I leave?',
    answer: 'You can export your data and you can delete your account (GDPR-friendly).'
  }
];

const FAQAccordion = () => {
  return (
    <section id="faq" className="py-20 bg-base-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-vibrant/10 text-brand-vibrant text-xs font-bold uppercase tracking-wider rounded-full mb-4">
            <HelpCircle size={12} />
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-base-content mb-4">
            Frequently asked questions
          </h2>
          <p className="text-base-content/80">
            We show clear escalation logic — safety automation should never feel like a black box.
          </p>
        </div>

        <Accordion.Root type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <Accordion.Item
              key={index}
              value={`item-${index}`}
              className="bg-base-200 rounded-xl border border-base-300/50 overflow-hidden"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between px-8 py-5 text-left">
                  <span className="font-semibold text-base-content text-base">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className="text-base-content/40 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <div className="px-8 pb-5 text-base text-base-content/80 leading-relaxed">
                  {faq.answer}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
};

export default FAQAccordion;
