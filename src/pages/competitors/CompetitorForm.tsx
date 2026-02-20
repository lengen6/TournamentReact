import { useState } from "react";
import type { FormEvent } from "react";

export type CompetitorFormValues = {
  firstName: string;
  lastName: string;
};

type CompetitorFormProps = {
  initialValues?: CompetitorFormValues;
  submitLabel: string;
  onSubmit: (values: CompetitorFormValues) => void;
};

const validNamePattern = /^[a-zA-Z/' -]+$/;
const maxNameLength = 25;

export function CompetitorForm({
  initialValues,
  submitLabel,
  onSubmit,
}: CompetitorFormProps) {
  const [firstName, setFirstName] = useState(initialValues?.firstName ?? "");
  const [lastName, setLastName] = useState(initialValues?.lastName ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName) {
      setErrorMessage("First Name is required.");
      return;
    }

    if (
      trimmedFirstName.length > maxNameLength ||
      trimmedLastName.length > maxNameLength
    ) {
      setErrorMessage(`Names must be ${maxNameLength} characters or fewer.`);
      return;
    }

    if (
      !validNamePattern.test(trimmedFirstName) ||
      (trimmedLastName.length > 0 && !validNamePattern.test(trimmedLastName))
    ) {
      setErrorMessage(
        "Names can only include letters, spaces, apostrophes, slashes, and hyphens.",
      );
      return;
    }

    setErrorMessage(null);
    onSubmit({ firstName: trimmedFirstName, lastName: trimmedLastName });
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className="alert alert-danger py-2" role="alert">
          {errorMessage}
        </div>
      ) : null}
      <div className="mb-3">
        <label htmlFor="firstName" className="form-label">
          First Name
        </label>
        <input
          id="firstName"
          name="firstName"
          className="form-control"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          required
          maxLength={maxNameLength}
          pattern="[a-zA-Z/' -]+"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="lastName" className="form-label">
          Last Name (Optional)
        </label>
        <input
          id="lastName"
          name="lastName"
          className="form-control"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          maxLength={maxNameLength}
          pattern="[a-zA-Z/' -]+"
        />
      </div>
      <div className="form-group">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
