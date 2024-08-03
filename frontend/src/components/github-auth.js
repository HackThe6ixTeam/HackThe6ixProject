'use client'

import React from 'react';
import axios from 'axios';

const GithubAuth = () => {

    const github_auth_endpoint = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo&state=${process.env.GITHUB_RANDOM_STATE}&redirect_uri=http://127.0.0.1:3000/api/github`;

    return (
        <a 
            href={github_auth_endpoint}
            className="inline-block px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors duration-200"
        >
            Authorize Github Access
        </a>
    );
};

export default GithubAuth;