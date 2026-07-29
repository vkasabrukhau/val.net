const arrowAsset = "/assets/arrow_forward_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";

export default function ArrowIcon({ className = "", direction = "forward" }) {
  return <span aria-hidden="true" className={`arrow-icon arrow-icon--${direction} ${className}`} style={{ "--arrow-icon": `url(${arrowAsset})` }} />;
}
