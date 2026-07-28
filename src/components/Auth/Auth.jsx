import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './authContext.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import styles from './Auth.module.css';

const setField = (key, set) => (e) => {
  const value = e.target.value;
  set((prev) => ({ ...prev, [key]: value }));
};

export default function Auth({ setCurrentPage }) {
  const [mode, setMode] = useState('auth'); // auth | verify
  const [info, setInfo] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    code: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, verifyEmail, resendVerification } = useContext(AuthContext);
  const { t } = useLanguage();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verifyToken');
    if (!verifyToken) return;

    let cancelled = false;
    (async () => {
      setMode('verify');
      setInfo(t.auth.verifying);
      const result = await verifyEmail({ token: verifyToken });
      if (cancelled) return;
      if (result.success) {
        setInfo(`${result.message} ${t.auth.enterPassAfterVerify}`);
        setMode('auth');
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        setErrors({ email: result.message });
        setInfo('');
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryAutoLogin = async () => {
    if (!formData.email || !formData.password) return false;
    const loginResult = await login(formData.email, formData.password);
    if (loginResult.success) {
      setCurrentPage(localStorage.getItem('currentPage') || 'main');
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setInfo('');

    if (mode === 'verify') {
      if (!formData.email || !formData.code) {
        return setErrors({ email: t.auth.enterMailAndCode });
      }
      const result = await verifyEmail({
        email: formData.email,
        code: formData.code,
      });
      if (!result.success) return setErrors({ email: result.message });

      // ვერიფიკაციის შემდეგ ავტომატურად შევდივართ
      const loggedIn = await tryAutoLogin();
      if (loggedIn) return;

      setInfo(`${result.message} ${t.auth.enterPassAfterVerify}`);
      setMode('auth');
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      setCurrentPage(localStorage.getItem('currentPage') || 'main');
      return;
    }

    if (result.needsVerification) {
      setMode('verify');
      setInfo(result.message);
      // ავტომატურად მოვითხოვოთ ახალი კოდი სატესტოდ
      const resent = await resendVerification(formData.email);
      if (resent.success) {
        setInfo(resent.message);
        if (resent.code) setFormData((prev) => ({ ...prev, code: resent.code }));
      }
      return;
    }

    setErrors({
      email:
        result.message ||
        t.auth.badLogin,
    });
  };

  const handleResend = async () => {
    setErrors({});
    if (!formData.email) return setErrors({ email: t.auth.enterEmailFirst });
    const result = await resendVerification(formData.email);
    if (!result.success) return setErrors({ email: result.message });
    setInfo(result.message);
    if (result.code) {
      setFormData((prev) => ({ ...prev, code: result.code }));
    }
  };

  return (
    <div className={styles.authWrapper}>
      <aside className={styles.heroPanel} aria-hidden="true">
        <img
          className={styles.heroImage}
          src="/images/auth-hero.png"
          alt=""
        />
      </aside>

      <div className={styles.formPanel}>
      <form onSubmit={handleSubmit} className={styles.authForm}>
        <img
          className={styles.brandLogo}
          src="/images/logo-m.png"
          alt="History of Music"
        />
        <h2>
          {mode === 'verify' ? t.auth.verifyTitle : t.auth.loginTitle}
        </h2>

        {mode === 'verify' ? (
          <>
            {info && <p className={styles.infoText}>{info}</p>}
            {formData.code && (
              <p className={styles.codeBox}>
                {t.auth.codePrefix} <strong>{formData.code}</strong>
              </p>
            )}
            <input
              className={styles.input}
              type="email"
              placeholder={t.auth.email}
              value={formData.email}
              onChange={setField('email', setFormData)}
              required
            />
            <input
              className={styles.input}
              type="text"
              placeholder={t.auth.code}
              value={formData.code}
              onChange={setField('code', setFormData)}
              required
              maxLength={6}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            <button className={styles.submitButton} type="submit">
              {t.auth.confirmAndLogin}
            </button>
            <button type="button" className={styles.backButton} onClick={() => setCurrentPage('main')}>
              <span className={styles.backArrow} aria-hidden="true">←</span>
              <span>{t.adminPage.back}</span>
            </button>
            <button type="button" className={styles.secondaryButton} onClick={handleResend}>
              {t.auth.resendCode}
            </button>
            <p className={styles.toggleText} onClick={() => setMode('auth')}>
              {t.auth.backToLogin}
            </p>
          </>
        ) : (
          <>
            <input
              className={styles.input}
              type="email"
              placeholder={t.auth.realEmail}
              value={formData.email}
              onChange={setField('email', setFormData)}
              required
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}

            <div className={styles.passwordField}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder={t.auth.password}
                value={formData.password}
                onChange={setField('password', setFormData)}
                required
                minLength={6}
                maxLength={10}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <p className={styles.hintText}>{t.auth.adminOnlyHint}</p>
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}

            {info && <p className={styles.infoText}>{info}</p>}

            <button className={styles.submitButton} type="submit">
              {t.auth.loginTitle}
            </button>
            <button type="button" className={styles.backButton} onClick={() => setCurrentPage('main')}>
              <span className={styles.backArrow} aria-hidden="true">←</span>
              <span>{t.adminPage.back}</span>
            </button>
          </>
        )}
      </form>
      </div>
    </div>
  );
}
