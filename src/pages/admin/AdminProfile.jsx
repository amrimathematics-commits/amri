import { useAuth } from "../../context/AuthContext";

const AdminProfile = () => {
  const { admin } = useAuth();
  return (
    <div>
      <h1 className="font-serif text-2xl text-[#101c4d] mb-1">Profile</h1>
      <p className="text-sm text-[#101c4d]/60 mb-8">Your admin account</p>

      <div className="bg-white rounded-lg border border-[#101c4d]/10 p-6 max-w-md">
        <div className="space-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#101c4d]/50">Name</p>
            <p className="text-[#101c4d] mt-0.5">{admin?.name}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#101c4d]/50">Email</p>
            <p className="text-[#101c4d] mt-0.5">{admin?.email}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-[#101c4d]/50">Role</p>
            <p className="text-[#101c4d] mt-0.5 capitalize">{admin?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;