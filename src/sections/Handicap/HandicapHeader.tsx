interface HandicapHeaderProps {
  title?: string;
  description?: string;
}

/** Displays the Handicap page title and its explanatory text. */
export function HandicapHeader({
  title = 'Handicap Setup',
  description = 'Configure average-based handicap values separately for men and women.',
}: HandicapHeaderProps) {
  return (
    <div>
      <h1>{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
