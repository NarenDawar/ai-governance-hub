'use client';

import { motion } from 'framer-motion';

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
}

const cardVariants = {
  offscreen: { y: 50, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, duration: 1 }
  }
};

export default function TestimonialCard({ quote, name, title }: TestimonialProps) {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white p-8 rounded-lg shadow-lg"
    >
      <p className="text-gray-600 italic">&ldquo;{quote}&rdquo;</p>
      <div className="mt-4">
        <p className="font-bold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </motion.div>
  );
}