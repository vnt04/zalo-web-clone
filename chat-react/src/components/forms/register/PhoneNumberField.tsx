import { AxiosError } from "axios";
import { FC } from "react";
import { checkPhoneNumberExists } from "../../../utils/api";
import { InputContainerHeader, InputError } from "../../../utils/styles";
import { RegisterFormFieldProps } from "../../../utils/types/form";
import { InputContainer, InputField, InputLabel } from "../../common/Input";

export const PhoneNumberField: FC<RegisterFormFieldProps> = ({
  register,
  errors,
}) => {
  return (
    <InputContainer>
      <InputContainerHeader>
        <InputLabel htmlFor="phoneNumber">Phone number (+84)</InputLabel>
        {errors.phoneNumber && (
          <InputError>{errors.phoneNumber.message}</InputError>
        )}
      </InputContainerHeader>
      <InputField
        type="text"
        id="phoneNumber"
        {...register("phoneNumber", {
          required: "Phone number is required",
          minLength: {
            value: 3,
            message: "Must be 3 characters long",
          },
          maxLength: {
            value: 16,
            message: "Exceeds 16 characters",
          },
          validate: {
            checkPhoneNumber: async (phoneNumber: string) => {
              try {
                await checkPhoneNumberExists(phoneNumber);
              } catch (err) {
                return (
                  (err as AxiosError).response?.status === 409 &&
                  "Phone number already exists"
                );
              }
            },
          },
        })}
      />
    </InputContainer>
  );
};
