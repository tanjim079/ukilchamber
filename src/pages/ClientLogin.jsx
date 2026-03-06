import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { AiOutlineHome } from 'react-icons/ai';
import { signInWithGoogle } from '../services/authService';
import logo from '../../public/logo drk.png'

const ClientLogin = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setError("");
      setLoading(true);

      await login(email, password, "client");

    } catch (err) {

      console.log(err);
      setError("Login failed");

    } finally {

      setLoading(false);

    }

  };



  const handleGoogleLogin = async () => {

    try {

      await signInWithGoogle("client");

    } catch (err) {

      console.error(err);

    }

  };



  return (

    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        <div className='flex justify-between items-center'>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-500 font-medium bg-gray-100 px-4 py-2 rounded-lg shadow hover:bg-gray-200 transition"
          >
            <AiOutlineHome className="text-xl" /> {t('home')}
          </button>

          <Link to='/'>

            <img src={logo} className='h-24' alt="" />

          </Link>

        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">

          {t('clientLogin')}

        </h2>

        <p className="mt-2 text-center text-sm text-gray-600">

          {t('orSignUp')}{' '}

          <Link to="/client-signup" className="font-medium text-blue-600 hover:text-blue-500">

            {t('createAccount')}

          </Link>

        </p>

      </div>



      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          <form className="space-y-6" onSubmit={handleSubmit}>

            {error && (

              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">

                {error}

              </div>

            )}



            <div>

              <label htmlFor="email" className="block text-sm font-medium text-gray-700">

                {t('email')}

              </label>

              <div className="mt-1">

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />

              </div>

            </div>



            <div>

              <label htmlFor="password" className="block text-sm font-medium text-gray-700">

                {t('password')}

              </label>

              <div className="mt-1">

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />

              </div>

            </div>



            <div className="flex items-center justify-between">

              <div className="text-sm">

                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">

                  {t('forgotPassword')}

                </Link>

              </div>

            </div>



            <div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >

                {loading ? t('signingIn') : t('signIn')}

              </button>

            </div>

          </form>



          {/* Divider */}

          <div className="mt-6">

            <div className="relative">

              <div className="absolute inset-0 flex items-center">

                <div className="w-full border-t border-gray-300" />

              </div>

              <div className="relative flex justify-center text-sm">

                <span className="px-2 bg-white text-gray-500">

                  OR

                </span>

              </div>

            </div>

          </div>



          {/* Google Login Button */}

          <div className="mt-6">

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-md hover:bg-gray-100"
            >

              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5"
              />

              Continue with Google

            </button>

          </div>

        </div>

      </div>



      <div className="text-center mt-4">

        <p className="text-sm text-gray-600">

          <Link to="/lawyer-login" className="font-medium text-blue-600 hover:text-blue-500">

            {t('loginAsLawyerLink')}

          </Link>

        </p>

      </div>

    </div>

  );

};

export default ClientLogin;