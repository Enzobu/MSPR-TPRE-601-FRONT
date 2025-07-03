import useLoggedUser from '../../hooks/useLoggedUser';
import { useTranslation } from 'react-i18next';

const UserProfile = () => {
  const { t } = useTranslation();
  const { user: userLogged, loading, error } = useLoggedUser();

  if (loading) return <p>{t('forms.loading')}</p>;
  if (error) return <p>{t('errors.generic')}: {error}</p>;

  return (
<div className="max-w-2xl mx-auto mt-10 p-6 rounded-2xl shadow-md">
  <h1 className="text-3xl font-bold text-center mb-6">{t('profile.title')}</h1>
  <div className="space-y-4">
    <p>
      <span className="font-semibold">{t('userProfile.lastName')} :</span> {userLogged?.lastname}
    </p>
    <p>
      <span className="font-semibold">{t('userProfile.firstName')} :</span> {userLogged?.firstname}
    </p>
    <p>
      <span className="font-semibold">{t('userProfile.email')} :</span> {userLogged?.email}
    </p>
    <p>
      <span className="font-semibold">{t('userProfile.role')} :</span> {userLogged?.isAdmin === true ? t('userProfile.administrator') : t('userProfile.user')}
    </p>
  </div>
</div>

  );
};

export default UserProfile;
