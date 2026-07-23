import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './authContext';
import styles from './Auth.module.css'

const Auth = ({ setCurrentPage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({}); // შეცდომების სტეიტი
  const { register, login } = useContext(AuthContext);

  useEffect(() => {
    const updateAuthType = () => {
      const authType = localStorage.getItem('authType');
      setIsLogin(authType !== 'register');
      setErrors({});
    };
    updateAuthType();
    window.addEventListener('storage', updateAuthType);
    return () => window.removeEventListener('storage', updateAuthType);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // თავიდან ვასუფთავებთ ერორებს

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        return setErrors({ confirmPassword: "პაროლები არ ემთხვევა!" });
      }
      const result = await register(formData.fullName, formData.email, formData.password);
      if (result.success) {
        // ავტომატური შესვლა რეგისტრაციის შემდეგ
        const loginResult = await login(formData.email, formData.password);
        if (loginResult.success) setCurrentPage('main');
      } else {
        setErrors({ email: result.message });
      }
    } else {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        setCurrentPage('main');
      } else {
        setErrors({ email: "არასწორი ელ-ფოსტა ან პაროლი" });
      }
    }
  };

  return (
    <div className={styles.authWrapper}>
      <form key={isLogin} onSubmit={handleSubmit} className={styles.authForm}>
        <h2>{isLogin ? "შესვლა" : "რეგისტრაცია"}</h2>

        {!isLogin && (
          <input className={`${styles.input} ${errors.fullName ? styles.errorInput : ''}`} 
            type="text" placeholder="სახელი და გვარი" onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
        )}

        <input className={`${styles.input} ${errors.email ? styles.errorInput : ''}`} 
          type="email" placeholder="ელ-ფოსტა" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
        {errors.email && <span className={styles.errorText}>{errors.email}</span>}

        <input className={`${styles.input} ${errors.password ? styles.errorInput : ''}`} 
          type="password" placeholder="პაროლი" onChange={(e) => setFormData({...formData, password: e.target.value})} required />

        {!isLogin && (
          <input className={`${styles.input} ${errors.confirmPassword ? styles.errorInput : ''}`} 
            type="password" placeholder="გაიმეორეთ პაროლი" onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
        )}
        {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}

        <button className={styles.submitButton} type="submit">{isLogin ? "შესვლა" : "რეგისტრაცია"}</button>
        <p className={styles.toggleText} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "არ გაქვს ანგარიში? დარეგისტრირდი" : "უკვე გაქვს ანგარიში? შედი"}
        </p>
      </form>
    </div>
  );
};

export default Auth;