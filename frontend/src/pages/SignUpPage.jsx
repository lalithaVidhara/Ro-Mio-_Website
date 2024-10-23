import React from 'react';
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {userPlus, Mail, Lock, User, ArrowRight, Loader} from 'lucide-react';
import {motion} from 'framer-motion';

const SignUpPage = () => {
  const loading = true;

  const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <motion.div></motion.div>
    </div>
  )

};

export default SignUpPage;