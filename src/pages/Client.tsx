import CloseDialog from "../components/CloseDialog";
import SettingsModal from "../components/SettingsModal";
import Sidebar from "../components/Sidebar";
import type { AppLocale } from "../i18n";
import type { AppResolution, ClientAnimation } from "../settings";
import type { PresenceStatus, Translate } from "../types/ui";

type ClientProps = {
  accentColor: string;
  allowFriendRequests: boolean;
  clientAnimation: ClientAnimation;
  closeDialogOpen: boolean;
  error?: string;
  locale: AppLocale;
  onAccentColorChange: (accentColor: string) => void;
  onAllowFriendRequestsChange: (allowFriendRequests: boolean) => void;
  onClientAnimationChange: (clientAnimation: ClientAnimation) => void;
  onCloseDialogClose: () => void;
  onLocaleChange: (locale: AppLocale) => void;
  onLogout: () => void;
  onQuit: () => void;
  onResolutionChange: (resolution: AppResolution) => void;
  onSettingsClose: () => void;
  profileAvatarUrl?: string;
  profileName: string;
  resolution: AppResolution;
  settingsOpen: boolean;
  supportsFourKResolution: boolean;
  supportsTwoKResolution: boolean;
  t: Translate;
};

function Client({
  accentColor,
  allowFriendRequests,
  clientAnimation,
  closeDialogOpen,
  error,
  locale,
  onAccentColorChange,
  onAllowFriendRequestsChange,
  onClientAnimationChange,
  onCloseDialogClose,
  onLocaleChange,
  onLogout,
  onQuit,
  onResolutionChange,
  onSettingsClose,
  profileAvatarUrl,
  profileName,
  resolution,
  settingsOpen,
  supportsFourKResolution,
  supportsTwoKResolution,
  t,
}: ClientProps) {
  const presenceStatus: PresenceStatus = "online";
  const playButtonAnimated =
    clientAnimation === "all" || clientAnimation === "ui-elements";

  return (
    <>
      <Sidebar
        presenceStatus={presenceStatus}
        profileAvatarUrl={profileAvatarUrl}
        profileName={profileName}
        t={t}
      />

      <button
        className="client-play-button"
        data-animated={playButtonAnimated}
        type="button"
      >
        <span>{t("client-play")}</span>
      </button>

      <section className="dashboard-panel" aria-label="Dashboard">
        {error ? <p className="message error">{error}</p> : null}
      </section>

      {closeDialogOpen ? (
        <CloseDialog
          t={t}
          onClose={onCloseDialogClose}
          onLogout={onLogout}
          onQuit={onQuit}
        />
      ) : null}

      {settingsOpen ? (
        <SettingsModal
          accentColor={accentColor}
          allowFriendRequests={allowFriendRequests}
          clientAnimation={clientAnimation}
          locale={locale}
          resolution={resolution}
          supportsFourKResolution={supportsFourKResolution}
          supportsTwoKResolution={supportsTwoKResolution}
          t={t}
          vision="Vision.ALL"
          onAccentColorChange={onAccentColorChange}
          onAllowFriendRequestsChange={onAllowFriendRequestsChange}
          onClientAnimationChange={onClientAnimationChange}
          onClose={onSettingsClose}
          onLocaleChange={onLocaleChange}
          onResolutionChange={onResolutionChange}
        />
      ) : null}
    </>
  );
}

export default Client;
