import React, {useState} from 'react';
import SignUpForm from './SignUpForm';
import SignInForm from './SignInForm';

const Log = () => {

    const [signUpModal, setSignUpModal] = useState(true);
    const [signInModal, setSignInModal] = useState(false);

    const handleModals = (e) => {
        if(e.target.id === 'register') {
            setSignInModal(false)
            setSignUpModal(true)
        }else if (e.target.id === 'login'){
            setSignUpModal(false)
            setSignInModal(true)
        }
    } 

    return (
        <div className='connection-form'>
            <div className='form-container'>
                <ul>
                    <li onClick={handleModals} id='register'>S'inscrire</li>
                    <li onClick={handleModals} id='login'>Se connecter</li>
                </ul>
                {signUpModal && <SignInForm/> }
                {signInModal && <SignUpForm/>}
            </div>
        </div>
    );
};

export default Log;