import { useState } from "react";
import useCreateUser from "../../hooks/useCreateUser";
import { useTranslation } from 'react-i18next';

interface UserAddProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserAdd = ({ onSuccess, onCancel }: UserAddProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    isAdmin: false,
  });

  const { createUser, loading, error, createdUser } = useCreateUser();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser(formData);
    if (createdUser && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="addUserForm">
      <label htmlFor="firstname">{t('forms.firstName')}</label>
      <input id="firstname" name="firstname" type="text" placeholder={t('forms.firstName')} onChange={handleChange} required aria-required="true" />
      <label htmlFor="lastname">{t('forms.lastName')}</label>
      <input id="lastname" name="lastname" type="text" placeholder={t('forms.lastName')} onChange={handleChange} required aria-required="true" />
      <label htmlFor="email">{t('auth.email')}</label>
      <input id="email" name="email" type="email" placeholder={t('auth.email')} onChange={handleChange} required aria-required="true" />
      <label htmlFor="password">{t('auth.password')}</label>
      <input id="password" name="password" type="password" placeholder={t('auth.password')} onChange={handleChange} required aria-required="true" />
      <label htmlFor="isAdmin">{t('userProfile.administrator')} :
        <input id="isAdmin" name="isAdmin" type="checkbox" onChange={handleChange} />
      </label>
      <button type="submit" disabled={loading} aria-label={t('forms.createUser')}>
        {loading ? t('forms.creating') : t('forms.createUser')}
      </button>
      <button type="button" className="cancelButton" onClick={onCancel} aria-label={t('forms.cancelCreation')}>{t('forms.cancel')}</button>
      {error && <p style={{ color: "red" }} aria-live="polite">{error}</p>}
      {createdUser && <p aria-live="polite">{t('users.userCreated', { name: createdUser.firstname })}</p>}
    </form>
  );
};

export default UserAdd;
