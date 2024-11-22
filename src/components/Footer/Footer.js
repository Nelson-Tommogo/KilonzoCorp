import React, { useState } from "react";
import styles from './Footer.module.css';
import { FiChevronDown } from 'react-icons/fi';
import { FaFacebook, FaTiktok, FaInstagram, FaTwitter } from 'react-icons/fa';

const servicesData = [
    { name: 'Image & Video Annotation', number: '+254700000000', color: '#fefefe' },
    { name: 'Text Annotation', number: '+254700000000', color: '#fefefe' },
    { name: 'Audio Annotation', number: '+254700000000', color: '#fefefe' },
    { name: '3D Point Cloud Annotation', number: '+254700000000', color: '#fefefe' },
];

const Footer = () => {
    const [openService, setOpenService] = useState(null);

    const toggleService = (index) => {
        if (openService === index) {
            setOpenService(null);
        } else {
            setOpenService(index);
        }
    };

    return (
        <>
            <div style={{ backgroundColor: '#818589', paddingTop: '89px', paddingBottom: '90px' }}>
                <div className="container">
                    <div className="row">
                        <div className={`col-lg-3 col-sm-6 ${styles.contain}`}>
                            <p className={styles.logo}>KilonzoCorp</p>
                            <p className={styles.text}>
                                KilonzoCorp Holdings LTD specializes in advanced annotation services for machine learning and AI projects.
                            </p>
                            <p className={styles.text}>
                                Our tailored solutions ensure accuracy and efficiency, empowering businesses to build cutting-edge technologies.
                            </p>
                            <div className={styles.social_logo}>
                                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                                    <FaFacebook className={styles.icon} />
                                </a>
                                <a href="https://vm.tiktok.com/" target="_blank" rel="noopener noreferrer">
                                    <FaTiktok className={styles.icon} />
                                </a>
                                <a href="https://www.instagram.com/kilonzocorp/profilecard/?igsh=amRqM3h3dDNsa2c=" target="_blank" rel="noopener noreferrer">
                                    <FaInstagram className={styles.icon} />
                                </a>
                                <a href="https://x.com/Kilonzocorp" target="_blank" rel="noopener noreferrer">
                                    <FaTwitter className={styles.icon} />
                                </a>
                            </div>
                        </div>

                        <div className={`col-lg-3 col-sm-6 ${styles.contain}`}>
                            <p className={styles.head}>Our Services</p>
                            {servicesData.map((service, index) => (
                                <div key={index}>
                                    <div className={styles.text} onClick={() => toggleService(index)}>
                                        {service.name}
                                        <FiChevronDown style={{ marginLeft: '8px', cursor: 'pointer' }} />
                                    </div>
                                    {openService === index && (
                                        <div
                                            className={styles.text}
                                            style={{ cursor: 'pointer', color: service.color }}
                                            onClick={() => window.location.href = `tel:${service.number}`}
                                        >
                                            Call {service.number}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={`col-lg-3 col-sm-6 ${styles.contain}`}>
                            <p className={styles.head}>Usefull Links</p>
                            <p className={styles.text}>Westlands, Nairobi, Kenya</p>
                            <p className={styles.text}>contact@kilonzocorp.co.ke</p>
                            <p className={styles.text}>+254700000000</p>
                        </div>

                        <div className={`col-lg-3 col-sm-6 ${styles.contain}`}>
                            <p className={styles.head}>Opening Hours</p>
                            <p className={styles.text}>Mon - Fri : 08:00 - 18:00</p>
                            <p className={styles.text}>Sat : 10:00 - 16:00</p>
                            <p className={styles.text}>Support : 24/7</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: '#285a77', borderTop: 'solid 1px #707070' }}>
                <p className={styles.bottom}>Copyright © 2024 Kilonzocorp. All rights reserved</p>
            </div>
        </>
    );
};

export default Footer;
