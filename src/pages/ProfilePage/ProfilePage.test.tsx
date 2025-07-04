import { describe, it, expect, vi, type Mock } from "vitest";

import useLoggedUser from "../../hooks/useLoggedUser";
import { render, screen, fireEvent } from "../../test-utils";

import ProfilePage from "./ProfilePage";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "profile.loading": "Chargement de votre profil...",
        "errors.loadingError": "Erreur de chargement",
        "errors.generic": "Une erreur est survenue",
        "profile.title": "Profil utilisateur",
        "sections.personalInfo": "Informations personnelles",
        "sections.userManagement": "Gestion utilisateurs",
        "sections.security": "Sécurité",
        "sections.preferences": "Préférences",
        "sections.manageProfile": "Gérer votre profil",
        "sections.changePassword": "Modifier votre mot de passe",
        "sections.configurePreferences": "Configurer vos préférences",
        "sections.manageUsers": "Gérer les utilisateurs",
        "accessControl.personalInfoDescription": "Gérez vos informations personnelles et paramètres",
        "userProfile.administrator": "Administrateur",
        "userProfile.user": "Utilisateur",
        "navigation.logout": "Déconnexion",
        "accessControl.accessDenied": "Accès refusé",
        "accessControl.adminRequired": "Droits administrateur requis"
      };
      return translations[key] || key;
    },
    i18n: {
      language: "fr",
      changeLanguage: vi.fn(),
    },
  }),
  useI18n: () => ({
    language: "fr",
    changeLanguage: vi.fn(),
  }),
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock du hook useLoggedUser
vi.mock("../../hooks/useLoggedUser");

const mockUser = {
  id_user: 1,
  lastname: "Dupont",
  firstname: "Jean",
  email: "jean.dupont@example.com",
  isAdmin: false,
};

const mockAdmin = {
  ...mockUser,
  isAdmin: true,
};

describe("ProfilePage", () => {
  it("devrait afficher le message de chargement", () => {
    (useLoggedUser as Mock).mockReturnValue({ loading: true });
    render(<ProfilePage />);
    expect(
      screen.getByText("Chargement de votre profil...")
    ).toBeInTheDocument();
  });

  it("devrait afficher un message d'erreur", () => {
    (useLoggedUser as Mock).mockReturnValue({ error: "Une erreur" });
    render(<ProfilePage />);
    expect(screen.getByText("Erreur de chargement")).toBeInTheDocument();
    expect(
      screen.getByText(/une erreur est survenue : une erreur/i)
    ).toBeInTheDocument();
  });

  describe("quand l'utilisateur est connecté", () => {
    it("devrait afficher les informations du profil par défaut", () => {
      (useLoggedUser as Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });
      render(<ProfilePage />);
      const profileElements = screen.getAllByText("Profil utilisateur");
      expect(profileElements.length).toBeGreaterThan(0);
      const informationElements = screen.getAllByText(
        "Informations personnelles"
      );
      expect(informationElements.length).toBeGreaterThan(0);
    });

    it('ne devrait pas afficher le menu "Gestion utilisateurs" pour un non-admin', () => {
      (useLoggedUser as Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });
      render(<ProfilePage />);
      expect(
        screen.queryByText("Gestion utilisateurs")
      ).not.toBeInTheDocument();
    });

    it('devrait afficher le menu "Gestion utilisateurs" pour un admin', () => {
      (useLoggedUser as Mock).mockReturnValue({
        user: mockAdmin,
        loading: false,
      });
      render(<ProfilePage />);
      expect(screen.getByText("Gestion utilisateurs")).toBeInTheDocument();
    });

    it("devrait changer de section au clic sur le menu", () => {
      (useLoggedUser as Mock).mockReturnValue({
        user: mockUser,
        loading: false,
      });
      render(<ProfilePage />);

      // Cliquer sur le bouton Sécurité (utilisateur getByRole pour être plus précis)
      const securityButton = screen.getByRole("button", { name: /sécurité/i });
      fireEvent.click(securityButton);

      // Vérifier qu'il y a bien des éléments "Sécurité" après le clic
      const securityElements = screen.getAllByText("Sécurité");
      expect(securityElements.length).toBeGreaterThan(0);

      // Cliquer sur le bouton Préférences
      const preferencesButton = screen.getByRole("button", {
        name: /préférences/i,
      });
      fireEvent.click(preferencesButton);

      const preferencesElements = screen.getAllByText("Préférences");
      expect(preferencesElements.length).toBeGreaterThan(0);
    });
  });
});
