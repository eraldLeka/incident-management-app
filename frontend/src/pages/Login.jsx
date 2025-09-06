import LoginForm from '../components/Forms/LoginForm';
import { Link } from 'react-router-dom';

import './Login.css';

const Login = () => {
  console.log("Login component rendered");
  return (
    <div className="login-container">
      <LoginForm />       
    </div>
  );
};
export default Login;
