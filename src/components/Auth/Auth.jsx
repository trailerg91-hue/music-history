import { useState, useContext, useEffect } from 'react';
import { AuthContext } from './authContext.jsx';
import { PASSWORD_HINT, validatePasswordClient } from '../../utils/passwordRules.js';
import styles from './Auth.module.css';

const setField = (key, set) => (e) => {
  const value = e.target.value;
  set((prev) => ({ ...prev, [key]: value }));
};

export default function Auth({ setCurrentPage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [mode, setMode] = useState('auth'); // auth | verify
  const [info, setInfo] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, login, verifyEmail, resendVerification } = useContext(AuthContext);

  useEffect(() => {
    const sync = () => {
      setIsLogin(localStorage.getItem('authType') !== 'register');
      setErrors({});
      setInfo('');
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyToken = params.get('verifyToken');
    if (!verifyToken) return;

    let cancelled = false;
    (async () => {
      setMode('verify');
      setInfo('მიმდინარეობს ელ-ფოსტის დადასტურება...');
      const result = await verifyEmail({ token: verifyToken });
      if (cancelled) return;
      if (result.success) {
        setInfo(result.message + ' ახლა შეიყვანე პაროლი და შეხედი.');
        setIsLogin(true);
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
      setCurrentPage('main');
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
        return setErrors({ email: 'შეიყვანე ელ-ფოსტა და კოდი' });
      }
      const result = await verifyEmail({
        email: formData.email,
        code: formData.code,
      });
      if (!result.success) return setErrors({ email: result.message });

      // ვერიფიკაციის შემდეგ ავტომატურად შევდივართ
      const loggedIn = await tryAutoLogin();
      if (loggedIn) return;

      setInfo(result.message + ' ახლა შეხედი იმავე პაროლით.');
      setMode('auth');
      setIsLogin(true);
      return;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        return setErrors({ confirmPassword: 'პაროლები არ ემთხვევა!' });
      }

      const passwordError = validatePasswordClient(formData.password);
      if (passwordError) return setErrors({ password: passwordError });

      const result = await register(formData.fullName, formData.email, formData.password);
      if (!result.success) return setErrors({ email: result.message });

      // სატესტო რეჟიმში პაროლი განახლდა უკვე ვერიფიცირებულ ანგარიშზე
      if (result.passwordUpdated) {
        setInfo(result.message);
        setIsLogin(true);
        setMode('auth');
        return;
      }

      setMode('verify');
      setInfo(result.message);
      if (result.code) {
        setFormData((prev) => ({ ...prev, code: result.code }));
      }
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      setCurrentPage('main');
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
        'არასწორი ელ-ფოსტა ან პაროლი. თუ დაგავიწყდა, რეგისტრაციიდან თავიდან სცადე (სატესტო რეჟიმში პაროლი განახლდება).',
    });
  };

  const handleResend = async () => {
    setErrors({});
    if (!formData.email) return setErrors({ email: 'ჯერ შეიყვანე ელ-ფოსტა' });
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
          src="/images/auth-hero-v3.png"
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
          {mode === 'verify' ? 'მეილის დადასტურება' : isLogin ? 'შესვლა' : 'რეგისტრაცია'}
        </h2>

        {mode === 'verify' ? (
          <>
            {info && <p className={styles.infoText}>{info}</p>}
            {formData.code && (
              <p className={styles.codeBox}>
                შენი კოდი: <strong>{formData.code}</strong>
              </p>
            )}
            <input
              className={styles.input}
              type="email"
              placeholder="ელ-ფოსტა"
              value={formData.email}
              onChange={setField('email', setFormData)}
              required
            />
            <input
              className={styles.input}
              type="text"
              placeholder="6-ნიშნა კოდი"
              value={formData.code}
              onChange={setField('code', setFormData)}
              required
              maxLength={6}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            <button className={styles.submitButton} type="submit">
              დადასტურება და შესვლა
            </button>
            <button type="button" className={styles.secondaryButton} onClick={handleResend}>
              კოდის ხელახლა მიღება
            </button>
            <p className={styles.toggleText} onClick={() => setMode('auth')}>
              უკან შესვლაზე
            </p>
          </>
        ) : (
          <>
            {!isLogin && (
              <input
                className={styles.input}
                type="text"
                placeholder="სახელი და გვარი"
                value={formData.fullName}
                onChange={setField('fullName', setFormData)}
                required
              />
            )}

            <input
              className={styles.input}
              type="email"
              placeholder="რეალური ელ-ფოსტა"
              value={formData.email}
              onChange={setField('email', setFormData)}
              required
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}

            <div className={styles.passwordField}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="პაროლი (6-10 სიმბოლო)"
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
                aria-label={showPassword ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {!isLogin && (
              <p className={styles.hintText}>
                სატესტო რეჟიმი: კოდი გამოჩნდება ეკრანზე. თუ შესვლა ვერ ხერხდება, თავიდან
                დარეგისტრირდი იმავე მეილით — პაროლი განახლდება.
              </p>
            )}
            {!isLogin && <p className={styles.hintText}>{PASSWORD_HINT}</p>}
            {errors.password && <span className={styles.errorText}>{errors.password}</span>}

            {!isLogin && (
              <div className={styles.passwordField}>
                <input
                  className={styles.input}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="გაიმეორეთ პაროლი"
                  value={formData.confirmPassword}
                  onChange={setField('confirmPassword', setFormData)}
                  required
                  minLength={6}
                  maxLength={10}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            )}
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}

            {info && <p className={styles.infoText}>{info}</p>}

            <button className={styles.submitButton} type="submit">
              {isLogin ? 'შესვლა' : 'რეგისტრაცია'}
            </button>
            <p
              className={styles.toggleText}
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setInfo('');
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
            >
              {isLogin ? 'არ გაქვს ანგარიში? დარეგისტრირდი' : 'უკვე გაქვს ანგარიში? შედი'}
            </p>
          </>
        )}
      </form>
      </div>
    </div>
  );
}
