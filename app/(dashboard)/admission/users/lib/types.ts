import { signUpFormErrors, User } from "@/lib/types"

export type ExportSafeUser = Pick<User, "firstName" | "lastName" | "email" | "role">

export type SafeUser = Pick<User, "firstName" | "lastName" | "email" | "role" | "id">

export interface CreateUserErrors extends signUpFormErrors {
    role?: string,
    universityName?: string,
    universityLocation?:string,
    gpa?: string,
    level?: string
}
