import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import toast from 'react-hot-toast';
import { apiManager } from '../utils/api';

const GlobalStyle = createGlobalStyle`
  body {
    padding: 0;
    margin: 0;
    background-color: #131722;
    color: #FEFEFE;
    font-family: Arial, sans-serif;
  }
`;

const Container = styled.div`
    text-align: center;
    margin-bottom: 100px;
`;

const Form = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
    padding: 20px;
    border-radius: 5px;
    max-width: 300px;
    margin: auto;
`;

const Input = styled.input`
    margin: 10px 0;
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
`;

const Button = styled.button`
    padding: 10px 20px;
    cursor: pointer;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    &:hover {
        background-color: #0056b3;
    }
`;

function SignupPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState({
        user_name: '',
        user_pw: '',
        nickname: '',
    })
    

    const onClickSignUp = async () => {
        if (
            !user.user_name ||
            !user.user_pw ||
            !user.nickname
          ) {
            toast.error("필수 항목을 입력해 주세요.");
            return;
          }
          let result = await apiManager('auth/sign-up', 'create', { ...user});
          if (!result) {
            return;
          } else {
            toast.success("회원가입이 완료되었습니다.")
            window.location.replace('/login')
          }
        }


    return (
        <>
            <GlobalStyle />
            <Container>
                <h2>Sign Up</h2>
                <Form>
                    <Input type="text" placeholder="ID" onChange={(e) => setUser({...user, user_name: e.target.value})} />
                    <Input type="password" placeholder="Password" onChange={(e) => setUser({...user, user_pw:e.target.value})} />
                    <Input type="text" placeholder="Nickname" onChange={(e) => setUser({...user, nickname: e.target.value})} />
                    <Button type='submit' onClick={onClickSignUp}>Sign Up</Button>
                </Form>
            </Container>
        </>
    );
}

export default SignupPage;
