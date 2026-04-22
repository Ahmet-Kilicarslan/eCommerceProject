import express from 'express';

import UserApplication from '../application/UserApplication.js';
import {requireAuth} from '../infrastructure/middlewares/authenticate.js';
import UserRepository from "../domain/user/UserRepository.js";
import UserService from "../domain/user/UserService.js";



const router = express.Router();



const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userApplication = new UserApplication(userService,userRepository);




// Check authentication status
router.get('/status', (req, res) => {
    try {

        if (req.session && req.session.userId) {
            res.json({
                isAuthenticated: true,
                user: {
                    id: req.session.userId,
                    username: req.session.username,
                    role: req.session.role
                }
            });
        } else {
            res.json({isAuthenticated: false});
        }
    } catch (error) {
        console.error('❌ Status check error:', error.error.status);
        res.status(500).json({
            error: 'Failed to get status',
            message: error.message
        });
    }
});


//register endpoint
router.post("/register", async (req, res) => {
    try {

        const user = req.body;
        const result = await userApplication.createUser(user);

        res.status(201).json({
            message: 'User registered successfully',
            user: result.toSafeObject()
        });


    } catch (error) {
        console.error('❌ Registration error:', error);
        const statusCode = error.statusCode || 500;

        res.status(statusCode).json({
            error: 'Registration failed',
            message: error.message
        });

    }
});

//login endpoint ,we will create session here
router.post("/login", async (req, res) => {

    try {

        const user = await userApplication.login(req.body);

        // Add these debug logs:
        console.log('User found:', user);
        console.log('Session before save:', req.session);



        req.session.userId = user.id;
        req.session.username = user.username || user.username?.value;
        req.session.email = user.email || user.email?.value;
        req.session.role = user.role;


        console.log(req.session.userId);
        console.log(req.session.username);
        console.log(req.session.role);




        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error:', err);
                return res.status(500).json({error: 'Session creation failed'});
            }

            console.log('✅ Login successful for:', user.username);

            res.json({
                message: 'Login successful',
                user: user.toSafeObject()
            });
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            error: '  Login failed',
            message: error.message
        });
    }


});
//logout endpoint
router.post("/logout", async (req, res) => {
    try {


        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('❌ Logout error:', err);
                    return res.status(500).json({
                        error: 'Could not log out, please try again'
                    });
                } else {
                    res.clearCookie('sessionId');
                    console.log('✅ Logout successful');
                    res.json({message: 'Logout successful'});
                }
            });
        } else {
            res.json({message: 'no active session'});
        }

    } catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({
            error: '  Logout failed',
            message: error.message
        });
    }


});



// Get profile (PROTECTED route - uses your middlewares!)
router.get('/profile', requireAuth, async (req, res) => {
    try {

        const user = await userApplication.getUserById(req.session.userId);
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }

        res.json({
            message: 'Profile retrieved successfully',
            user: user.toSafeObject()
        });
    } catch (error) {
        console.error('❌ Profile fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch profile',
            message: error.message
        });
    }
});

//get all users
router.get('/users', async (req, res) => {
    try {
        const allUsers = await userApplication.getAllUsers();
        res.status(201).json(allUsers)
    } catch (error) {
        console.error("Failed to fetch all users", error);
        res.status(500).json({
            error: 'Failed to fetch all users',
            message: error.message
        })
    }
});

//update user
router.put('/', async (req, res) => {
    try {

        let {id, username, email, password} = req.body;

        // Prepare data
        const updateData = {
            id,
            username,
            email,
            password
        };



        const updatedUser = await userApplication.updateUser(updateData);
        res.status(200).json(updatedUser.toSafeObject());

    } catch (error) {
        console.error("Failed update user backend router", error);
        res.status(500).json({
            error: 'FAiled to update user in backend router',
            message: error.message
        })
    }
});


export default router;