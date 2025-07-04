import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';

import useUpdateUser from "../../hooks/useUpdateUser";
import type { User, EditUserForm } from "../../types/types";

interface EditUserFormProps {
  user: User;
  onClose: () => void;
  onUpdate: (updated: User) => void;
}

const UserEdit = ({ user, onClose, onUpdate }: EditUserFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EditUserForm>({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    isAdmin: user.isAdmin,
  });

  const { updateUser, loading, error, updatedUserId } = useUpdateUser();

  useEffect(() => {
    if (updatedUserId === user.id_user) {
      onUpdate({
        id_user: user.id_user,
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        isAdmin: formData.isAdmin,
      });
      onClose();
    }
  }, [updatedUserId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(user.id_user, formData);
  };

  return (
    <form className="editUserForm" onSubmit={handleSubmit}>
      <h3>{t('users.editUser')}</h3>
      <label htmlFor="firstname">{t('forms.firstName')}</label>
      <input id="firstname" name="firstname" type="text" value={formData.firstname} onChange={handleChange} aria-required="true" />
      <label htmlFor="lastname">{t('forms.lastName')}</label>
      <input id="lastname" name="lastname" type="text" value={formData.lastname} onChange={handleChange} aria-required="true" />
      <label htmlFor="email">{t('auth.email')}</label>
      <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} aria-required="true" />
      <label htmlFor="isAdmin">{t('userProfile.administrator')} :
        <input id="isAdmin" name="isAdmin" type="checkbox" checked={formData.isAdmin} onChange={handleChange} />
      </label>
      <button type="submit" disabled={loading} aria-label={t('forms.updateUser')}>
        {loading ? t('forms.updating') : t('forms.update')}
      </button>
      <button type="button" onClick={onClose} aria-label={t('forms.cancel')}>{t('forms.cancel')}</button>
      {error && <p style={{ color: "red" }} aria-live="polite">{error}</p>}
    </form>
  );
};

export default UserEdit;
