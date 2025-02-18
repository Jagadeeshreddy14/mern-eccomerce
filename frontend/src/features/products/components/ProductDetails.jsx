import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  clearSelectedProduct,
  fetchProductByIdAsync,
  resetProductFetchStatus,
  selectProductFetchStatus,
  selectSelectedProduct,
} from '../ProductSlice';
import {
  Box,
  Checkbox,
  Rating,
  Stack,
  Typography,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  addToCartAsync,
  resetCartItemAddStatus,
  selectCartItemAddStatus,
  selectCartItems,
} from '../../cart/CartSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import {
  fetchReviewsByProductIdAsync,
  resetReviewFetchStatus,
  selectReviewFetchStatus,
  selectReviews,
} from '../../review/ReviewSlice';
import { Reviews } from '../../review/components/Reviews';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import Favorite from '@mui/icons-material/Favorite';
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  resetWishlistItemAddStatus,
  resetWishlistItemDeleteStatus,
  selectWishlistItemAddStatus,
  selectWishlistItemDeleteStatus,
  selectWishlistItems,
} from '../../wishlist/WishlistSlice';
import { useTheme } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import MobileStepper from '@mui/material/MobileStepper';
import Lottie from 'lottie-react';
import { loadingAnimation } from '../../../assets';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const COLORS = ['#020202', '#F6F6F6', '#B82222', '#BEA9A9', '#E2BB8D'];
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export const ProductDetails = () => {
  const { id } = useParams();
  const product = useSelector(selectSelectedProduct);
  const loggedInUser = useSelector(selectLoggedInUser);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems) || [];
  const cartItemAddStatus = useSelector(selectCartItemAddStatus);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(-1);
  const reviews = useSelector(selectReviews) || [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const theme = useTheme();
  const is1420 = useMediaQuery(theme.breakpoints.down(1420));
  const is990 = useMediaQuery(theme.breakpoints.down(990));
  const is840 = useMediaQuery(theme.breakpoints.down(840));
  const is500 = useMediaQuery(theme.breakpoints.down(500));
  const is480 = useMediaQuery(theme.breakpoints.down(480));
  const is387 = useMediaQuery(theme.breakpoints.down(387));
  const is340 = useMediaQuery(theme.breakpoints.down(340));

  const wishlistItems = useSelector(selectWishlistItems) || [];
  const isProductAlreadyInCart = cartItems.some((item) => item?.product?._id === id);
  const isProductAlreadyInWishlist = wishlistItems.some((item) => item?.product?._id === id);
  const productFetchStatus = useSelector(selectProductFetchStatus);
  const reviewFetchStatus = useSelector(selectReviewFetchStatus);
  const totalReviewRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const totalReviews = reviews.length;
  const averageRating = parseInt(Math.ceil(totalReviewRating / totalReviews || 0));
  const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus);
  const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = product?.images?.length || 0;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductByIdAsync(id));
      dispatch(fetchReviewsByProductIdAsync(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (cartItemAddStatus === 'fulfilled') {
      toast.success('Product added to cart');
      dispatch(resetCartItemAddStatus());
    } else if (cartItemAddStatus === 'rejected') {
      toast.error('Error adding product to cart, please try again later');
      dispatch(resetCartItemAddStatus());
    }
  }, [cartItemAddStatus, dispatch]);

  useEffect(() => {
    if (wishlistItemAddStatus === 'fulfilled') {
      toast.success('Product added to wishlist');
      dispatch(resetWishlistItemAddStatus());
    } else if (wishlistItemAddStatus === 'rejected') {
      toast.error('Error adding product to wishlist, please try again later');
      dispatch(resetWishlistItemAddStatus());
    }
  }, [wishlistItemAddStatus, dispatch]);

  useEffect(() => {
    if (wishlistItemDeleteStatus === 'fulfilled') {
      toast.success('Product removed from wishlist');
      dispatch(resetWishlistItemDeleteStatus());
    } else if (wishlistItemDeleteStatus === 'rejected') {
      toast.error('Error removing product from wishlist, please try again later');
      dispatch(resetWishlistItemDeleteStatus());
    }
  }, [wishlistItemDeleteStatus, dispatch]);

  useEffect(() => {
    if (productFetchStatus === 'rejected') {
      toast.error('Error fetching product details, please try again later');
      dispatch(resetProductFetchStatus());
    }
  }, [productFetchStatus, dispatch]);

  useEffect(() => {
    if (reviewFetchStatus === 'rejected') {
      toast.error('Error fetching product reviews, please try again later');
      dispatch(resetReviewFetchStatus());
    }
  }, [reviewFetchStatus, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedProduct());
      dispatch(resetProductFetchStatus());
      dispatch(resetReviewFetchStatus());
      dispatch(resetWishlistItemDeleteStatus());
      dispatch(resetWishlistItemAddStatus());
      dispatch(resetCartItemAddStatus());
    };
  }, [dispatch]);

  const handleAddToCart = () => {
    if (!loggedInUser) {
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }
    const item = { user: loggedInUser._id, product: id, quantity };
    dispatch(addToCartAsync(item));
    setQuantity(1);
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncreaseQty = () => {
    setQuantity(quantity + 1);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddRemoveFromWishlist = (e) => {
    if (!loggedInUser) {
      toast.error('Please log in to manage your wishlist');
      navigate('/login');
      return;
    }

    if (e.target.checked) {
      dispatch(createWishlistItemAsync({ user: loggedInUser._id, product: id }));
    } else {
      const wishlistItem = wishlistItems.find((item) => item.product._id === id);
      if (wishlistItem) dispatch(deleteWishlistItemByIdAsync(wishlistItem._id));
    }
  };

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, maxSteps - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));
  const handleStepChange = (step) => setActiveStep(step);

  if ((productFetchStatus || reviewFetchStatus) === 'pending') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Lottie animationData={loadingAnimation} />
      </Box>
    );
  }

  if (!product) return null;

  return (
    <div style={{ padding: '20px' }}>
      {/* Product Details Section */}
      <div>
        {/* Image Gallery Section */}
        {!is1420 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {product.images?.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={`Product ${index}`}
                onClick={() => setSelectedImageIndex(index)}
                style={{
                  width: '100px',
                  height: '100px',
                  cursor: 'pointer',
                  border: selectedImageIndex === index ? '2px solid black' : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Main Image Display */}
        {is1420 ? (
          <AutoPlaySwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={activeStep}
            onChangeIndex={handleStepChange}
            enableMouseEvents
          >
            {product.images?.map((image, index) => (
              <div key={index}>
                {Math.abs(activeStep - index) <= 2 ? (
                  <img src={image.url} alt={`Product ${index}`} style={{ width: '100%' }} />
                ) : null}
              </div>
            ))}
          </AutoPlaySwipeableViews>
        ) : (
          <img
            src={product.images[selectedImageIndex]?.url}
            alt={`Product ${selectedImageIndex}`}
            style={{ width: '100%', height: 'auto', marginBottom: '20px' }}
          />
        )}

        {is1420 && (
          <MobileStepper
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            nextButton={
              <Button onClick={handleNext} disabled={activeStep === maxSteps - 1}>
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
              </Button>
            }
            backButton={
              <Button onClick={handleBack} disabled={activeStep === 0}>
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
              </Button>
            }
          />
        )}
      </div>

      {/* Product Info Section */}
      <div>
        <Typography variant="h4">{product.title}</Typography>
        <Typography>({totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'})</Typography>
        <Typography>In Stock: {product.stockQuantity}</Typography>
        <Typography>Price: ${product.price}</Typography>
        <Typography>Description: {product.description}</Typography>

        {!loggedInUser?.isAdmin && (
          <div>
            {/* Color Selector */}
            <div>
              <Typography>Colors:</Typography>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {COLORS.map((color, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedColorIndex(index)}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: color === '#F6F6F6' ? '1px solid grayText' : '',
                      backgroundColor: color,
                      borderRadius: '100%',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <Typography>Size:</Typography>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {SIZES.map((size) => (
                  <motion.div
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      border: selectedSize === size ? 'none' : '1px solid grayText',
                      borderRadius: '8px',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '1.2rem',
                      backgroundColor: selectedSize === size ? '#DB4444' : 'whitesmoke',
                      color: selectedSize === size ? 'white' : '',
                    }}
                  >
                    {size}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quantity and Cart Controls */}
            <div style={{ marginTop: '20px' }}>
              <Button onClick={handleDecreaseQty}>-</Button>
              <span style={{ margin: '0 10px' }}>{quantity}</span>
              <Button onClick={handleIncreaseQty}>+</Button>
            </div>

            {isProductAlreadyInCart ? (
              <Button
                onClick={() => navigate('/cart')}
                style={{ backgroundColor: 'black', color: 'white', marginTop: '10px' }}
              >
                View Cart
              </Button>
            ) : (
              <Button onClick={handleAddToCart} style={{ marginTop: '10px' }}>
                Add To Cart
              </Button>
            )}

            {/* Wishlist Toggle */}
            <Checkbox
              checked={isProductAlreadyInWishlist}
              onChange={handleAddRemoveFromWishlist}
              icon={<FavoriteBorder />}
              checkedIcon={<Favorite />}
              style={{ marginTop: '10px' }}
            />
          </div>
        )}

        {/* Shipping Info */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LocalShippingOutlinedIcon />
            <Typography>Free Delivery Enter postal code for delivery options</Typography>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <CachedOutlinedIcon />
            <Typography>30-Day Returns Free returns within 30 days</Typography>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '20px' }}>
        <Typography variant="h5">Reviews</Typography>
        <Reviews reviews={reviews} />
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '10px 15px',
  fontSize: '1.05rem',
  backgroundColor: 'transparent',
  outline: 'none',
  border: '1px solid black',
  borderRadius: '8px',
  cursor: 'pointer',
};