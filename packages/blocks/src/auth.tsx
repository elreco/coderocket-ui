"use client";
import { useId, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button, Card, Field, Input, InputGroup } from "@coderocket/react";
import { ActionForm, type FormAction } from "./common";

function AuthFrame({
  title,
  description,
  eyebrow,
  icon,
  footer,
  children,
}: {
  title: string;
  description: string;
  eyebrow: string;
  icon: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <div className="cr-block-form cr-auth-shell">
      <Card className="cr-auth-card" aria-labelledby={titleId} footer={footer}>
        <header className="cr-auth-header">
          <div className="cr-auth-intro">
            <span className="cr-auth-symbol" aria-hidden="true">
              {icon}
            </span>
            <span className="cr-auth-eyebrow">{eyebrow}</span>
          </div>
          <h2 id={titleId} className="cr-auth-title">
            {title}
          </h2>
          <p className="cr-auth-description">{description}</p>
        </header>
        {children}
      </Card>
    </div>
  );
}

function PasswordInput({
  name,
  autoComplete,
  minLength,
  placeholder = "Enter your password",
}: {
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup
      name={name}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      minLength={minLength}
      required
      placeholder={placeholder}
      leading={<LockKeyhole size={16} aria-hidden="true" />}
      trailing={
        <Button
          type="button"
          variant="ghost"
          className="cr-auth-password-toggle"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? (
            <EyeOff size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
        </Button>
      }
    />
  );
}

export function LoginBlock({
  onSubmit,
  signupHref,
  forgotHref,
}: {
  onSubmit: FormAction;
  signupHref: string;
  forgotHref: string;
}) {
  return (
    <AuthFrame
      title="Welcome back."
      description="Sign in to your workspace and pick up where you left off."
      eyebrow="Your workspace"
      icon={<LockKeyhole size={24} strokeWidth={1.75} />}
      footer={
        <p className="cr-auth-footer">
          New here?{" "}
          <a className="cr-auth-link" href={signupHref}>
            Create an account <ArrowRight size={14} aria-hidden="true" />
          </a>
        </p>
      }
    >
      <ActionForm
        onSubmit={onSubmit}
        submitLabel="Sign in"
        submitIcon={<ArrowRight size={17} aria-hidden="true" />}
        successMessage="Signed in."
      >
        <Field label="Email address">
          <InputGroup
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            leading={<Mail size={16} aria-hidden="true" />}
          />
        </Field>
        <Field label="Password">
          <PasswordInput name="password" autoComplete="current-password" />
        </Field>
        <div className="cr-auth-assistance">
          <a className="cr-auth-link" href={forgotHref}>
            Forgot password?
          </a>
        </div>
      </ActionForm>
    </AuthFrame>
  );
}

export function SignupBlock({
  onSubmit,
  loginHref,
}: {
  onSubmit: FormAction;
  loginHref: string;
}) {
  return (
    <AuthFrame
      title="Make room for what’s next."
      description="Create your account. A fresh workspace starts here."
      eyebrow="A new beginning"
      icon={<UserRound size={23} strokeWidth={1.75} />}
      footer={
        <p className="cr-auth-footer">
          Already have an account?{" "}
          <a className="cr-auth-link" href={loginHref}>
            Sign in <ArrowRight size={14} aria-hidden="true" />
          </a>
        </p>
      }
    >
      <ActionForm
        onSubmit={onSubmit}
        submitLabel="Create account"
        submitIcon={<ArrowRight size={17} aria-hidden="true" />}
        successMessage="Check your inbox to confirm your email address."
      >
        <Field label="Full name">
          <InputGroup
            name="name"
            autoComplete="name"
            required
            placeholder="Your full name"
            leading={<UserRound size={16} aria-hidden="true" />}
          />
        </Field>
        <Field label="Email address">
          <InputGroup
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            leading={<Mail size={16} aria-hidden="true" />}
          />
        </Field>
        <Field label="Password" description="Use at least 12 characters.">
          <PasswordInput
            name="password"
            autoComplete="new-password"
            minLength={12}
            placeholder="Create a password"
          />
        </Field>
      </ActionForm>
    </AuthFrame>
  );
}

export function ForgotPasswordBlock({
  onSubmit,
  loginHref,
}: {
  onSubmit: FormAction;
  loginHref: string;
}) {
  return (
    <AuthFrame
      title="Let’s get you back in."
      description="Enter your account’s email address. We’ll send you a link to choose a new password."
      eyebrow="Account recovery"
      icon={<KeyRound size={24} strokeWidth={1.75} />}
      footer={
        <p className="cr-auth-footer">
          <a className="cr-auth-link" href={loginHref}>
            <ArrowLeft size={14} aria-hidden="true" /> Back to sign in
          </a>
        </p>
      }
    >
      <ActionForm
        onSubmit={onSubmit}
        submitLabel="Send reset link"
        submitIcon={<ArrowRight size={17} aria-hidden="true" />}
        successMessage="If this address has an account, a reset link is on its way."
      >
        <Field label="Email address">
          <InputGroup
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
            leading={<Mail size={16} aria-hidden="true" />}
          />
        </Field>
      </ActionForm>
    </AuthFrame>
  );
}

export function ResetPasswordBlock({ onSubmit }: { onSubmit: FormAction }) {
  return (
    <AuthFrame
      title="A fresh start."
      description="Choose a new password to get back to your workspace."
      eyebrow="Reset password"
      icon={<ShieldCheck size={24} strokeWidth={1.75} />}
    >
      <ActionForm
        onSubmit={onSubmit}
        validate={(data) =>
          data.get("password") !== data.get("confirmation")
            ? "Passwords do not match. Enter the same password in both fields."
            : undefined
        }
        submitLabel="Update password"
        submitIcon={<ArrowRight size={17} aria-hidden="true" />}
        successMessage="Your password has been updated."
      >
        <Field label="New password" description="Use at least 12 characters.">
          <PasswordInput
            name="password"
            autoComplete="new-password"
            minLength={12}
            placeholder="Create a new password"
          />
        </Field>
        <Field label="Confirm password">
          <PasswordInput
            name="confirmation"
            autoComplete="new-password"
            minLength={12}
            placeholder="Enter it one more time"
          />
        </Field>
      </ActionForm>
    </AuthFrame>
  );
}

export function OtpBlock({
  onSubmit,
  length = 6,
}: {
  onSubmit: FormAction;
  length?: number;
}) {
  const size = Number.isFinite(length)
    ? Math.max(4, Math.min(10, Math.floor(length)))
    : 6;
  return (
    <AuthFrame
      title="Check your inbox."
      description={`Enter the ${size}-digit verification code from your email to continue.`}
      eyebrow="One more step"
      icon={<Mail size={24} strokeWidth={1.75} />}
    >
      <ActionForm
        onSubmit={onSubmit}
        submitLabel="Verify code"
        submitIcon={<ArrowRight size={17} aria-hidden="true" />}
        successMessage="Code verified."
      >
        <Field
          label="Verification code"
          description="You can paste the entire code into this field."
        >
          <Input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            minLength={size}
            maxLength={size}
            pattern={`[0-9]{${size}}`}
            required
            className="cr-otp"
            placeholder={"0".repeat(size)}
            style={{ "--cr-otp-length": size } as CSSProperties}
          />
        </Field>
      </ActionForm>
    </AuthFrame>
  );
}
