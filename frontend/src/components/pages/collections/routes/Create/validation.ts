import { yupToFormErrors } from 'formik';
import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
    name: Yup.string().min(4).nullable().required('Required'),
    url: Yup.string().url().optional(),
    desc: Yup.string().min(10).max(500),
    percentageFee: Yup.number().default(2.5) ,
    walletAddress:Yup.string().matches(/0x[a-fA-F0-9]{40}$/g , "invalid wallet address").required("payout wallet address  is a required field"),
})