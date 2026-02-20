import { describe, it, expect, beforeEach } from "vitest";
import { useVisualStore } from "../useVisualStore";

beforeEach(() => {
  useVisualStore.setState({
    is_running: false,
    current_background_id: null,
    active_animations: [],
    fps: 0,
  });
});

describe("useVisualStore", () => {
  // T5.23
  it("T5.23: initial state → is_running: false, current_background_id: null, active_animations: []", () => {
    const state = useVisualStore.getState();
    expect(state.is_running).toBe(false);
    expect(state.current_background_id).toBeNull();
    expect(state.active_animations).toEqual([]);
  });

  // T5.24
  it("T5.24: setCurrentBackgroundId('bg-id') → background ID set", () => {
    useVisualStore.getState().setCurrentBackgroundId("bg-id");
    expect(useVisualStore.getState().current_background_id).toBe("bg-id");
  });

  // T5.25
  it("T5.25: addAnimation('fireflies') → active_animations: ['fireflies']", () => {
    useVisualStore.getState().addAnimation("fireflies");
    expect(useVisualStore.getState().active_animations).toEqual(["fireflies"]);
  });

  // T5.26
  it("T5.26: addAnimation('fireflies') twice → no duplicates", () => {
    useVisualStore.getState().addAnimation("fireflies");
    useVisualStore.getState().addAnimation("fireflies");
    expect(useVisualStore.getState().active_animations).toEqual(["fireflies"]);
  });

  // T5.27
  it("T5.27: addAnimation multiple types → both present", () => {
    useVisualStore.getState().addAnimation("fireflies");
    useVisualStore.getState().addAnimation("shooting_stars");
    expect(useVisualStore.getState().active_animations).toEqual([
      "fireflies",
      "shooting_stars",
    ]);
  });

  // T5.28
  it("T5.28: removeAnimation('fireflies') → removed from array", () => {
    useVisualStore.getState().addAnimation("fireflies");
    useVisualStore.getState().addAnimation("shooting_stars");
    useVisualStore.getState().removeAnimation("fireflies");
    expect(useVisualStore.getState().active_animations).toEqual([
      "shooting_stars",
    ]);
  });

  // T5.29
  it("T5.29: removeAnimation('nonexistent') → no error, array unchanged", () => {
    useVisualStore.getState().addAnimation("fireflies");
    useVisualStore.getState().removeAnimation("aurora");
    expect(useVisualStore.getState().active_animations).toEqual(["fireflies"]);
  });

  // T5.30
  it("T5.30: setFps(30) → fps is 30", () => {
    useVisualStore.getState().setFps(30);
    expect(useVisualStore.getState().fps).toBe(30);
  });
});
