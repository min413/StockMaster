import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../auth/useAuthContext';
import toast from 'react-hot-toast';

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

const StyledLink = styled(Link)`
    color: white;
    text-decoration: none;
    margin-top: 10px;

    &:hover {
        text-decoration: underline;
    }
`;

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const { login } = useAuthContext()

    const toMainPage = () => {
        window.location.pathname = '/'
    }

    const onLogin = async () => {
        let user = await login(username, password)
        if (user) {
            toast.success("로그인하였습니다.")
            
        }
      }

    return (
        <>
            <GlobalStyle />
            <Container>
                <h2>Login</h2>
                <Form>
                    <Input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    onKeyPress={(e) => {
                        if (e.key == 'Enter') {
                          onLogin();
                        }
                      }}
                    />
                    <Button type="submit" onClick={onLogin}>Login</Button>
                    <StyledLink to="/signup">Don't have an account? Sign up</StyledLink>
                </Form>
                
            </Container>
        </>
    );
}

export default LoginPage;