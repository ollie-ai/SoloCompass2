export default function DestinationGrid({
  destinations = [],
  renderCard,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5',
}) {
  if (!destinations.length) return null;

  return (
    <div className={className}>
      {destinations.map((destination, index) => (
        <div key={destination?.id || destination?.slug || `${destination?.name || 'destination'}-${index}`}>
          {renderCard ? renderCard(destination, index) : null}
        </div>
      ))}
    </div>
  );
}
