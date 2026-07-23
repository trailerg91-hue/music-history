import { motion } from 'framer-motion';

const CountryCard = ({ country }) => {
  return (
    <motion.div 
      className={`country-card ${country.side}`}
      initial={{ opacity: 0, x: country.side === 'left' ? -100 : 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h3>{country.name}</h3>
      <p>{country.summary}</p>
      <button>მოსმენა</button>
    </motion.div>
  );
};
export default CountryCard;