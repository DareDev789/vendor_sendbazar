export default function FormatDateTime({dateString}) {
  if (!dateString) return '';

  const date = new Date(dateString);

  const optionsDate = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
  const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false };

  const dateFormatted = date.toLocaleDateString('fr-FR', optionsDate);
  const timeFormatted = date.toLocaleTimeString('fr-FR', optionsTime);

  return (
    <>
      {dateFormatted} {' à '}
      {timeFormatted}
    </>
  );
}
