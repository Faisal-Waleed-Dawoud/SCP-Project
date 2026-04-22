"use client"
import { updateUserProfile } from "@/app/(dashboard)/admission/users/lib/actions";
import { BaseFormState, PartnerUni, Student, UpdateUserProfileErrors, User } from "@/lib/types";
import React, { useActionState, useEffect } from "react";
import UpdateUserForm from "./UpdateUserForm";
import { toast } from "sonner";

export interface UpdateUserProfile extends BaseFormState<UpdateUserProfileErrors> {
  status: number
}


function ProfileForm({
  user,
  student,
  partnerUni,
}: {
  user: User;
  student?: Student;
  partnerUni?: PartnerUni;
}) {

  const initalState: UpdateUserProfile = {
    status: 0
  };
  const [state, formAction] = useActionState(updateUserProfile, initalState);
  useEffect(()=> {
    if (state.status === 200) {
      toast.success("Profile Updated Successfully")
    } else if (state.status === 401) {
      toast.error("Unauthorized")
    } else if (state.status === 400 || state.status === 500) {
      toast.error("An Error Happened, Try Again")
    }
  }, [state])

  return (
        <UpdateUserForm 
        isAdmin={false}
        formAction={formAction}
        state={state}
        user={user}
        student={student}
        partnerUni={partnerUni}>

        </UpdateUserForm>
  );
}

export default ProfileForm;
