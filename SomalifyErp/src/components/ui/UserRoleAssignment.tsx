import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store";
import { getAllRolesFn } from "@/Redux/Slice/RolesSlice";
import {
  getCompanyUserRolesFn,
  getMainUserRolesFn,
  assignRoleToCompanyUserFn,
  assignRoleToMainUserFn,
  removeRoleFromCompanyUserFn,
  removeRoleFromMainUserFn,
} from "@/Redux/Slice/UserRoleAssignmentSlice";
import toast from "react-hot-toast";
import { HiOutlineShieldCheck, HiOutlinePlus, HiOutlineXMark } from "react-icons/hi2";

interface UserRoleAssignmentProps {
  userId: number;
  userType: "company" | "main";
  companyId?: string;
}

export function UserRoleAssignment({
  userId,
  userType,
  companyId,
}: UserRoleAssignmentProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { data: allRoles } = useSelector((state: RootState) => state.roles);
  const { userRoles, isLoading, isError, errorMsg, assignLoading, removeLoading } =
    useSelector((state: RootState) => state.userRoleAssignment);

  useEffect(() => {
    dispatch(getAllRolesFn());
  }, [dispatch]);

  useEffect(() => {
    if (userId) {
      if (userType === "company") {
        dispatch(getCompanyUserRolesFn(userId));
      } else {
        dispatch(getMainUserRolesFn(userId));
      }
    }
  }, [dispatch, userId, userType]);

  useEffect(() => {
    if (isError) toast.error(errorMsg || "Failed to load user roles", { id: "user-roles" });
  }, [isError, errorMsg]);

  const currentRoleIds = userRoles.map((ur) => ur.role_id);
  const availableRoles = allRoles.filter((r) => !currentRoleIds.includes(r.id));

  const handleAssign = async (roleId: number) => {
    if (userType === "company") {
      if (!companyId) {
        toast.error("Company ID is required", { id: "assign-role" });
        return;
      }
      const res = await dispatch(
        assignRoleToCompanyUserFn({ roleId, userId, companyId })
      );
      if (assignRoleToCompanyUserFn.fulfilled.match(res)) {
        toast.success("Role assigned", { id: "assign-role" });
        dispatch(getCompanyUserRolesFn(userId));
      } else {
        toast.error(res.payload as string || "Failed to assign role", { id: "assign-role" });
      }
    } else {
      const res = await dispatch(assignRoleToMainUserFn({ roleId, userId }));
      if (assignRoleToMainUserFn.fulfilled.match(res)) {
        toast.success("Role assigned", { id: "assign-role" });
        dispatch(getMainUserRolesFn(userId));
      } else {
        toast.error(res.payload as string || "Failed to assign role", { id: "assign-role" });
      }
    }
  };

  const handleRemove = async (roleId: number) => {
    if (userType === "company") {
      const res = await dispatch(removeRoleFromCompanyUserFn({ roleId, userId }));
      if (removeRoleFromCompanyUserFn.fulfilled.match(res)) {
        toast.success("Role removed", { id: "remove-role" });
      } else {
        toast.error(res.payload as string || "Failed to remove role", { id: "remove-role" });
      }
    } else {
      const res = await dispatch(removeRoleFromMainUserFn({ roleId, userId }));
      if (removeRoleFromMainUserFn.fulfilled.match(res)) {
        toast.success("Role removed", { id: "remove-role" });
      } else {
        toast.error(res.payload as string || "Failed to remove role", { id: "remove-role" });
      }
    }
  };

  if (!userId) return null;

  if (userType === "company" && !companyId) {
    return (
      <p className="text-sm text-amber-600 dark:text-amber-400">
        Company ID is required to assign roles to this user.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
        <HiOutlineShieldCheck className="w-5 h-5 text-indigo-600" />
        Assign Permissions (Roles)
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Assign roles to give this user specific permissions. Each role includes a set of permissions.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading roles...
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Current roles ({userRoles.length})
            </p>
            {userRoles.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No roles assigned yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userRoles.map((ur) => (
                  <span
                    key={ur.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium"
                  >
                    {ur.role?.name}
                    <button
                      type="button"
                      onClick={() => handleRemove(ur.role_id)}
                      disabled={removeLoading}
                      className="p-0.5 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800/60 transition-colors"
                      aria-label="Remove role"
                    >
                      <HiOutlineXMark className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {availableRoles.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Add role
              </p>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleAssign(role.id)}
                    disabled={assignLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors disabled:opacity-50"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                    {role.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
