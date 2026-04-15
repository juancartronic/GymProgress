import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
  it("renderiza un div de barra con track", () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    const track = container.firstChild as HTMLElement;
    expect(track).toBeTruthy();
    expect(track.children.length).toBe(1);
  });

  it("aplica color personalizado", () => {
    const { container } = render(<ProgressBar value={50} max={100} color="red" />);
    const bar = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(bar.style.background).toBe("red");
  });
});
