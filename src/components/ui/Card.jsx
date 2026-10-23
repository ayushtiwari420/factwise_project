export default function Card({ children, className = '', title, action, ...props }) {
  return <section className={`ui-card ${className}`} {...props}>{(title || action) && <div className="ui-card__header">{title && <h2>{title}</h2>}{action}</div>}{children}</section>;
}
