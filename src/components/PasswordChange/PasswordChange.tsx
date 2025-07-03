import { useState } from "react";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useLoggedUser from "../../hooks/useLoggedUser";
import { useTranslation } from 'react-i18next';

const PasswordChange = () => {
  const { t } = useTranslation();
  const authHeader = useAuthHeader();
  const { user } = useLoggedUser();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { newPassword, confirmPassword } = formData;

    if (!newPassword || newPassword.length < 8) {
      setError(t('forms.passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('validation.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://qg.enzo-palermo.com:5001/swagger/users/${user?.id_user}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader || "",
          },
          body: JSON.stringify({
            password: newPassword,
            oldPassword: formData.oldPassword,
          }),
        }
      );

      if (!res.ok) throw new Error(t('forms.passwordUpdateFailed'));

      setSuccess(t('forms.passwordUpdateSuccess'));
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(t('forms.updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">{t('sections.changePassword')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="oldPassword" className="block mb-1 font-medium">
            {t('forms.currentPassword')}
          </label>
          <input
            id="oldPassword"
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
            className="bg-transparent w-full border border-gray-300 text-white-500 rounded-lg p-2 focus:outline-none focus:ring focus:ring-gray-300"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block mb-1 font-medium">
            {t('forms.newPassword')}
          </label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="bg-transparent w-full border border-gray-300 text-white-500 rounded-lg p-2 focus:outline-none focus:ring focus:ring-gray-300"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block mb-1 font-medium">
            {t('forms.confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="bg-transparent w-full border border-gray-300 text-white-500 rounded-lg p-2 focus:outline-none focus:ring focus:ring-gray-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded-lg border border-gray-400 hover:bg-gray-100 transition"
        >
          {loading ? t('forms.updating') : t('forms.update')}
        </button>

        {error && (
          <p className="text-sm mt-2" aria-live="polite">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm mt-2" aria-live="polite">
            {success}
          </p>
        )}
      </form>
    </div>
  );
};

export default PasswordChange;
