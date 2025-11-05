import ProfileProgress from "../../utils/ProfileProgress";

export default function ProfileHeader({ percentage }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800">Profil de la Boutique</h2>
      <ProfileProgress percentage={percentage} label={`Complétion du profil : ${percentage}%`} />
    </div>
  );
}
