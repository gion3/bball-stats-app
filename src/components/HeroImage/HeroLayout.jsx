import './HeroLayout.css';

const HeroLayout = ({imageUrl}) =>{



    return (
        <div className='hero-wrapper'>
            <div className='hero-text-box'>
                <h1 className='hero-title'>Basketball Stats Hub</h1>
                <h2 className='hero-text'>The game at your finger tips.</h2>
            </div>
            <div className='hero-img-container'>
                <img className='hero-img' src={imageUrl}></img>
            </div>
        </div>
    );
}

export default HeroLayout;