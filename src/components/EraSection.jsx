import CountryCard from './CountryCard';

const EraSection = ({ eraData }) => {
  return (
    <section className="era-section">
      <h2 className="era-title">
        {eraData.era} 
        <small style={{ display: 'block', fontSize: '1rem', color: '#666' }}>
          {eraData.yearRange}
        </small>
      </h2>
      
      <div className="countries-wrapper">
        {eraData.countries.map((country) => (
          <CountryCard key={country.id} country={country} />
        ))}
      </div>
    </section>
  );
};

export default EraSection;