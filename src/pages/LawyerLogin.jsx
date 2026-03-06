import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { AiOutlineHome } from 'react-icons/ai';
import { signInWithGoogle } from '../services/authService';
import logo from '../../public/logo drk.png';

export default function LawyerLogin() {

  const { t } = useTranslation();

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setError("");
      setLoading(true);

      await login(email,password,"lawyer");

    } catch (err) {

      console.log(err);
      setError("Login failed");

    } finally {

      setLoading(false);

    }

  };


  const handleGoogleLogin = async () => {

    try{

      await signInWithGoogle("lawyer");

    }
    catch(err){

      console.error(err);

    }

  };


  return (

<div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center">

<div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg mx-auto">

{/* HEADER */}

<div className='flex justify-between items-center'>

<button
onClick={()=>navigate('/')}
className="flex items-center gap-2 text-blue-600 hover:text-blue-500 font-medium bg-gray-100 px-4 py-2 rounded-lg shadow hover:bg-gray-200 transition"
>

<AiOutlineHome className="text-xl"/> {t('home')}

</button>

<Link to="/">
<img src={logo} className="h-24" alt="logo"/>
</Link>

</div>


{/* TITLE */}

<div>

<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">

{t('lawyerPortal')}

</h2>

<p className="mt-2 text-center text-sm text-gray-600">

{t('accessLegalPractice')}

</p>

</div>


{/* ERROR */}

{error && (

<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">

{error}

</div>

)}


{/* FORM */}

<form className="mt-8 space-y-6" onSubmit={handleSubmit}>

<div className="rounded-md shadow-sm space-y-4">

<input
id="email"
name="email"
type="email"
required
placeholder={t('emailAddress')}
className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<input
id="password"
name="password"
type="password"
required
placeholder={t('password')}
className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

</div>


<button
type="submit"
disabled={loading}
className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
>

{loading ? t('signingIn') : t('signIn')}

</button>

</form>


{/* DIVIDER */}

<div className="relative">

<div className="absolute inset-0 flex items-center">

<div className="w-full border-t border-gray-300"></div>

</div>

<div className="relative flex justify-center text-sm">

<span className="px-2 bg-white text-gray-500">

OR

</span>

</div>

</div>


{/* GOOGLE LOGIN */}

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


{/* LINKS */}

<div className="flex items-center justify-between text-sm">

<Link to="/client-login" className="font-medium text-blue-600 hover:text-blue-500">

{t('lookingForClientLogin')}

</Link>

<Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">

{t('needAccount')}

</Link>

</div>

</div>

</div>

  );

}