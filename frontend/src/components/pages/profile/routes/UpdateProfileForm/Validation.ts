import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
    username: Yup.string()
        .matches(/^[A-Za-z0-9\[_-]*$/, "Invalid username. Can only contain letters, numbers, hyphens (-), and underscores (_).")
        .nullable()
        .required('Required'),
    email: Yup.string().email().required('Required').nullable(),
    displayName: Yup.string().nullable().required('Required'),
    bio: Yup.string().nullable(),
})