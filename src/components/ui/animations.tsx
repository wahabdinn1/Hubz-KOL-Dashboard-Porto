"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

// Page transition wrapper
export const PageTransition = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

// Staggered list animation
export const StaggerContainer = ({
    children,
    className,
    staggerDelay = 0.1,
}: {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={{
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: staggerDelay,
                },
            },
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.3 }}
        className={className}
    >
        {children}
    </motion.div>
);

// Fade in animation
export const FadeIn = ({
    children,
    className,
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// Scale on hover for cards
export const ScaleOnHover = ({
    children,
    className,
    scale = 1.02,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
    scale?: number;
} & Omit<HTMLMotionProps<"div">, "scale">) => (
    <motion.div
        whileHover={{ scale }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={className}
        {...props}
    >
        {children}
    </motion.div>
);

// Slide in from side
export const SlideIn = ({
    children,
    className,
    direction = "left",
}: {
    children: React.ReactNode;
    className?: string;
    direction?: "left" | "right" | "up" | "down";
}) => {
    const variants = {
        left: { initial: { x: -50, opacity: 0 }, animate: { x: 0, opacity: 1 } },
        right: { initial: { x: 50, opacity: 0 }, animate: { x: 0, opacity: 1 } },
        up: { initial: { y: -50, opacity: 0 }, animate: { y: 0, opacity: 1 } },
        down: { initial: { y: 50, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    };

    return (
        <motion.div
            initial={variants[direction].initial}
            animate={variants[direction].animate}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Button press animation
export const PressableButton = ({
    children,
    className,
    onClick,
    disabled,
    type = "button",
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={className}
        onClick={onClick}
        disabled={disabled}
        type={type}
    >
        {children}
    </motion.button>
);
