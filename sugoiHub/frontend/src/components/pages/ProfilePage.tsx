import ProfileCard from "../homeComponents/ProfileCard";

export default function ProfilePage(){
  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Profile</h2>
        <p className="text-sm text-muted mt-1">Tu perfil público y estadísticas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ProfileCard />
        </div>
        <div className="bg-darkCard rounded-2xl p-6 shadow-card">
          <h3 className="text-lg font-semibold text-white">Activity</h3>
          <p className="text-sm text-muted mt-2">Resumen de tu actividad reciente.</p>
        </div>
      </div>
    </section>
  )
}
