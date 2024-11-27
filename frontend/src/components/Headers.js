import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthContext } from '../auth/useAuthContext';
import toast from 'react-hot-toast';


const StyledHeader = styled.header`
  background-color: #131829;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const StyledNav = styled.nav`
  display: flex;
`;

const StyledLink = styled(RouterLink)`
  color: white;
  margin-right: 20px;
  text-decoration: none;
  padding: 10px;
  border-radius: 5px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: gray;
  }
`;

const StyledBox = styled(RouterLink)`
  color: white;
  margin-right: 20px;
  text-decoration: none;
  padding: 10px;
  border-radius: 5px;
  cursor:default;
`;

const TitleLink = styled(StyledLink)`
  margin-right: auto;
`;

function Header() {
  const { user, logout } = useAuthContext()

  const onLogout = async () => {
    let result = await logout();
}

const toastEffect = () => {
  if (!user) {
    toast.error('로그인해주세요.')
  } else {
    return
  }
}

    return (
        <StyledHeader>
            <Container>
                <TitleLink to="/">주식 마스터</TitleLink>
                <StyledNav>
                    <StyledLink onClick={() => {!user && toastEffect()}} to={user ? "/portfolio" : ''}>My Portfolio</StyledLink>
                    {
                      user ? 
                      <StyledLink onClick={() => {onLogout()}} to="/login">Logout</StyledLink> 
                      :
                      <StyledLink to="/login">Login</StyledLink>
                    }
                    { user ?
                    <StyledBox>{user.nickname}님 환영합니다.</StyledBox>
                    : 
                    <StyledLink to="/signup">Sign up</StyledLink> 
                    }
                </StyledNav>
            </Container>
        </StyledHeader>
    );
}

export default Header;