import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavBar } from "../NavBar";
import { MemoryRouter } from "react-router-dom";

describe("NavBar", () => {
  it("no renderiza sin usuario", () => {
    const { container } = render(
      <MemoryRouter>
        <NavBar hasUser={false} accent="#c3ff00" muted="#666" />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renderiza los 5 items con usuario", () => {
    render(
      <MemoryRouter>
        <NavBar hasUser={true} accent="#c3ff00" muted="#666" />
      </MemoryRouter>,
    );
    expect(screen.getByText("nav.home")).toBeInTheDocument();
    expect(screen.getByText("nav.plans")).toBeInTheDocument();
    expect(screen.getByText("nav.diet")).toBeInTheDocument();
    expect(screen.getByText("nav.history")).toBeInTheDocument();
    expect(screen.getByText("nav.profile")).toBeInTheDocument();
  });
});
