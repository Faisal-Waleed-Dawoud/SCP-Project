"use server"
import { insertPartner, updatePartner } from "@/lib/db/partner"
import { insertStudent, updateStudent } from "@/lib/db/student"
import { authorize, getUserById, insertUser, updateUser, updateUserAndEmail, userExists } from "@/lib/db/users"
import { Roles, RolesURLS, UpdateUserProfileErrors, User } from "@/lib/types"
import { generateSalt, getCurrentUser, hash } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { deleteUser } from "./db"
import { CreateUserErrors } from "./types"
import { CreateUser } from "../components/createUserModal"
import { UpdateUser } from "../components/updateUserModal"
import { UpdateUserProfile } from "@/components/dashboard/ProfileForm"

export async function deleteUserAction(id: string) {
    const user = await getCurrentUser({ fullUser: true, redirectIfNotFound: true }) as User
    if (user.email === "u.preview@upm.edu.sa") {
        return {status: 401}
    }
    const isAuthorized = await authorize(user.role, "user:delete")
    if (isAuthorized === undefined) {
        return { status: 401, error: 'Unauthorized' }
    }

    try {
        await deleteUser(id)
        revalidatePath("/admission/users")
        return { status: 200 }
    } catch (error) {
        return { status: 500, error: error instanceof Error ? error.message : String(error) }
    }
}

export async function createUser(prevState: CreateUser | undefined, formData: FormData) {

    const currentUser = await getCurrentUser({ fullUser: true, redirectIfNotFound: true }) as User
    if (currentUser.email === "u.preview@upm.edu.sa") {
        return {status: 401}
    }
    const isAuthorized = await authorize(currentUser.role, "user:create")
    if (isAuthorized === undefined) {
        return
    }

    const errors: CreateUserErrors = {}

    const fName = formData.get("first-name") as string
    const lName = formData.get("last-name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const uniName = formData.get("uni-name") as string
    const uniLocation = formData.get("uni-location") as string
    const gpa = formData.get("gpa") as string
    const level = formData.get("level") as string


    // Validate Input

    if (!fName) {
        errors.firstName = "First Name Cannot Be Empty"
    }

    if (!lName) {
        errors.lastName = "Last Name Cannot Be Empty"
    }

    if (fName.match(/(<|>|"|!|&|\*|\(|\)|=|\+|\^|'|"|`|\@|#|%|\$|~|\|)/gm)) {
        errors.firstName = "First Name Cannot have special characters"
    }

    if (lName.match(/(<|>|"|!|&|\*|\(|\)|=|\+|\^|'|"|`|\@|#|%|\$|~|\|)/gm)) {
        errors.lastName = "Last Name Cannot have special characters"
    }

    if (fName.match(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/ug)) {
        errors.firstName = "First Name Cannot have emojies or number"
    }

    if (lName.match(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/ug)) {
        errors.lastName = "Last Name Cannot have emojies or numbers"
    }

    if (role === Roles.Partner_University_Admissions) {
        if (!uniName) {
            errors.universityName = "University Name cannot be empty"
        }
        if (!uniLocation) {
            errors.universityLocation = "University Location cannot be empty"
        }
    }

    if (!email) {
        errors.email = "Email Cannot Be Empty"
    }

    if (role === Roles.Student) {
        if (!gpa) {
            errors.gpa = "GPA cannot be left"
        }
        if (!level) {
            errors.level = "Level cannot be empty"
        }

        if (+gpa < 0 || +gpa > 4) {
            errors.gpa = "Invalid GPA"
        }

        if (+level < 1 || +level > 8) {
            errors.level = "Invalid Level"
        }

        if (!(email.match(/^\d{7}@upm.edu.sa/))) {
            errors.email = "Incorrect UPM student email"
        }
    }



    if (!password) {
        errors.password = "Password Cannot be Empty"
    }

    if (password.length < 6) {
        errors.password = "Password Length Should be more than 6 characters"
    }

    if (role !== Roles.Admission && role !== Roles.Student && role !== Roles.Partner_University_Admissions) {
        errors.role = "Invalid Role"
    }

    const user = await userExists(email) as User

    if (user != null) {
        errors.unknownError = "Cannot create user, user exists"
    }

    if (Object.keys(errors).length >= 1) {
        return { errors, payload: formData, status: 400 }
    }


    try {
        const salt = generateSalt()
        const hashedPassword = await hash(password, salt)
        const userId = await insertUser(fName, lName, email, hashedPassword, salt, role)

        if (role === Roles.Student) {
            const studid = email.slice(0, 7)
            await insertStudent(+studid, +gpa, +level, userId)
        } else if (role === Roles.Partner_University_Admissions) {
            await insertPartner(uniName, uniLocation, userId)
        }

        revalidatePath("/admission/users")
        return {errors: {}, payload: formData, status: 200}
    } catch (error) {
        errors.unknownError = error instanceof Error ? error.message : String(error)
        return {errors, payload: formData, status: 500}
    }
}

export async function updateUserAction(userId: string, prevState: UpdateUser | undefined, formData: FormData) {
    const currentUser = await getCurrentUser({ fullUser: true, redirectIfNotFound: true }) as User
    if (currentUser.email === "u.preview@upm.edu.sa") {
        return {state: 401}
    }
    const isAuthorized = await authorize(currentUser.role, "user:update")
    if (isAuthorized === undefined) {
        return
    }

    const user = await getUserById(userId) as User

    const errors: CreateUserErrors = {}

    const fName = formData.get("first-name") as string
    const lName = formData.get("last-name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const uniName = formData.get("uni-name") as string
    const uniLocation = formData.get("uni-location") as string
    const gpa = formData.get("gpa") as string
    const level = formData.get("level") as string


    // Validate Input

    if (!fName) {
        errors.firstName = "First Name Cannot Be Empty"
    }

    if (!lName) {
        errors.lastName = "Last Name Cannot Be Empty"
    }

    if (fName.match(/(<|>|"|!|&|\*|\(|\)|=|\+|\^|'|"|`|\@|#|%|\$|~|\|)/gm)) {
        errors.firstName = "First Name Cannot have special characters"
    }

    if (lName.match(/(<|>|"|!|&|\*|\(|\)|=|\+|\^|'|"|`|\@|#|%|\$|~|\|)/gm)) {
        errors.lastName = "Last Name Cannot have special characters"
    }

    if (fName.match(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/ug)) {
        errors.firstName = "First Name Cannot have emojies or number"
    }

    if (lName.match(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/ug)) {
        errors.lastName = "Last Name Cannot have emojies or numbers"
    }

    if (!email) {
        errors.email = "Email cannot be empty"
    }

    if (currentUser.role === Roles.Partner_University_Admissions) {
        if (!uniName) {
            errors.universityName = "University Name cannot be empty"
        }
        if (!uniLocation) {
            errors.universityLocation = "University Location cannot be empty"
        }
    }

    if (user.role === Roles.Student) {

        if (!(email.match(/^\d{7}@upm.edu.sa/))) {
            errors.email = "Incorrect UPM student email"
        }

        if (!gpa) {
            errors.gpa = "GPA cannot be left"
        }
        if (!level) {
            errors.level = "Level cannot be empty"
        }

        if (+gpa < 0 || +gpa > 4) {
            errors.gpa = "Invalid GPA"
        }

        if (+level < 1 || +level > 8) {
            errors.level = "Invalid Level"
        }
    }

    if (!password) {
        errors.password = "Password Cannot be Empty"
    }

    if (password.length < 6) {
        errors.password = "Password Length Should be more than 6 characters"
    }

    if (Object.keys(errors).length >= 1) {
        return { errors, payload: formData, state: 400 }
    }

    try {
        const salt = generateSalt()
        const hashedPassword = await hash(password, salt)
        await updateUserAndEmail(user.id, fName, lName, email, hashedPassword, salt)

        if (user.role === Roles.Student) {
            await updateStudent(user.id, +gpa, +level)
        } else if (user.role === Roles.Partner_University_Admissions) {
            await updatePartner(user.id, uniName, uniLocation)
        }

        revalidatePath(`/admission/users`)
        return {errors: {}, payload: formData, state: 200}
    } catch (error) {
        errors.unknownError = error instanceof Error ? error.message : String(error)
        return {errors, payload: formData, state: 500}
    }
}

export async function updateUserProfile(prevState: UpdateUserProfile | undefined, formData: FormData) {

    const currentUser = await getCurrentUser({ fullUser: true, redirectIfNotFound: true }) as User

    if (currentUser.email === "u.preview@upm.edu.sa" || currentUser.email === "admission@preview.com") {
        return {status: 401}
    }
    const errors: UpdateUserProfileErrors = {}

    const fName = formData.get("first-name") as string
    const lName = formData.get("last-name") as string
    const password = formData.get("password") as string
    const uniName = formData.get("uni-name") as string
    const uniLocation = formData.get("uni-location") as string
    const gpa = formData.get("gpa") as string
    const level = formData.get("level") as string


    // Validate Input

    if (!fName) {
        errors.firstName = "First Name Cannot Be Empty"
    }

    if (!lName) {
        errors.lastName = "Last Name Cannot Be Empty"
    }

    if (fName.match(/(<|>|"|!|&|\*|\(|\)|=|\+|\^|'|"|`|\@|#|%|\$|~|\|)/gm)) {
        errors.firstName = "First Name Cannot have special characters"
    }

    if (lName.match(/(<|>|"|!|&|\*|\(|\)|=|\+|\^|'|"|`|\@|#|%|\$|~|\|)/gm)) {
        errors.lastName = "Last Name Cannot have special characters"
    }

    if (fName.match(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/ug)) {
        errors.firstName = "First Name Cannot have emojies or number"
    }

    if (lName.match(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/ug)) {
        errors.lastName = "Last Name Cannot have emojies or numbers"
    }

    if (currentUser.role === Roles.Partner_University_Admissions) {
        if (!uniName) {
            errors.universityName = "University Name cannot be empty"
        }
        if (!uniLocation) {
            errors.universityLocation = "University Location cannot be empty"
        }
    }

    if (currentUser.role === Roles.Student) {
        if (!gpa) {
            errors.gpa = "GPA cannot be left"
        }
        if (!level) {
            errors.level = "Level cannot be empty"
        }

        if (+gpa < 0 || +gpa > 4) {
            errors.gpa = "Invalid GPA"
        }

        if (+level < 1 || +level > 8) {
            errors.level = "Invalid Level"
        }
    }



    if (!password) {
        errors.password = "Password Cannot be Empty"
    }

    if (password.length < 6) {
        errors.password = "Password Length Should be more than 6 characters"
    }

    if (Object.keys(errors).length >= 1) {
        return { errors, payload: formData, status: 400 }
    }

    try {
        const salt = generateSalt()
        const hashedPassword = await hash(password, salt)
        await updateUser(currentUser.id, fName, lName, hashedPassword, salt)
        
        if (currentUser.role === Roles.Student) {
            await updateStudent(currentUser.id, +gpa, +level)
        } else if (currentUser.role === Roles.Partner_University_Admissions) {
            await updatePartner(currentUser.id, uniName, uniLocation)
        }
        revalidatePath(`/${RolesURLS[currentUser.role]}`)
        return { errors: {}, payload: formData, status: 200 }
    } catch (error) {
        errors.unknownError = error instanceof Error ? error.message : String(error)
        return { errors, payload: formData, status: 500 }
    }
}