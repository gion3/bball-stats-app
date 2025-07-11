import './HeroLayout.css';
import logo from "../../assets/logo_with_ball.png";

const HeroLayout = ({imageUrl}) =>{



    return (
        <div className='hero-wrapper'>
            <div className='hero-text-box'>
                <img src={logo} alt="App Logo" style={{ height: "160px" }}></img>
                <h2 className='hero-text'>The game at your finger tips.</h2>
            </div>
            <div className='hero-img-container'>
                <img className='hero-img' src={imageUrl}></img>
            </div>
        </div>
    );
}

export default HeroLayout;