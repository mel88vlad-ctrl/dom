import React from 'react';
import { Section } from '../data/documentationData';
import { motion } from 'motion/react';

interface ConceptDocProps {
  section: Section;
}

export default function ConceptDoc({ section }: ConceptDocProps) {
  return (
    <motion.div
      key={section.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto p-8 md:p-12"
    >
      <div className="prose prose-indigo dark:prose-invert max-w-none">
        {section.content}
      </div>
    </motion.div>
  );
}
