import { ListenerManager } from "../lib/events.ts";
import { MultipleErrors } from "../lib/errors.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { spy as fn } from "@std/testing/mock";

type TestMessage = { update: { value: string } };

describe("ListenerManager", () => {
  describe("dispatch", () => {
    it("calls all registered listeners with the message", async () => {
      const manager = new ListenerManager<"update", TestMessage>();
      const listener1 = fn();
      const listener2 = fn();
      manager.addListener(listener1);
      manager.addListener(listener2);
      const msg: TestMessage = { update: { value: "test" } };
      await manager.dispatch(msg);
      expect(listener1.calls.length).toBe(1);
      expect(listener1.calls[0]?.args[0]).toBe(msg);
      expect(listener2.calls.length).toBe(1);
    });

    it("resolves when there are no listeners", async () => {
      const manager = new ListenerManager<"update", TestMessage>();
      await expect(
        manager.dispatch({ update: { value: "test" } }),
      ).resolves.toBeUndefined();
    });

    it("re-throws a single error when one listener throws synchronously", async () => {
      const manager = new ListenerManager<"update", TestMessage>();
      const err = new Error("single sync error");
      const second = fn();
      manager.addListener(() => {
        throw err;
      });
      manager.addListener(second);
      await expect(
        manager.dispatch({ update: { value: "test" } }),
      ).rejects.toBe(err);
      expect(second.calls.length).toBe(1);
    });

    it("re-throws a single rejected promise error directly", async () => {
      const manager = new ListenerManager<"update", TestMessage>();
      const err = new Error("async error");
      manager.addListener(() => Promise.reject(err));
      await expect(
        manager.dispatch({ update: { value: "test" } }),
      ).rejects.toBe(err);
    });

    it("wraps multiple synchronous throws in MultipleErrors", async () => {
      const manager = new ListenerManager<"update", TestMessage>();
      manager.addListener(() => {
        throw new Error("sync error 1");
      });
      manager.addListener(() => {
        throw new Error("sync error 2");
      });
      const rejection = await manager
        .dispatch({ update: { value: "test" } })
        .catch((e: unknown) => e);
      expect(rejection).toBeInstanceOf(MultipleErrors);
      expect((rejection as MultipleErrors).causes).toHaveLength(2);
    });

    it("wraps multiple rejected-promise errors in MultipleErrors", async () => {
      const manager = new ListenerManager<"update", TestMessage>();
      manager.addListener(() => Promise.reject(new Error("error 1")));
      manager.addListener(() => Promise.reject(new Error("error 2")));
      const rejection = await manager
        .dispatch({ update: { value: "test" } })
        .catch((e: unknown) => e);
      expect(rejection).toBeInstanceOf(MultipleErrors);
      expect((rejection as MultipleErrors).causes).toHaveLength(2);
    });
  });

  describe("removeListener", () => {
    it("does not call the listener after it is removed", async () => {
      const manager = new ListenerManager<"update", TestMessage>();
      const listener = fn();
      manager.addListener(listener);
      manager.removeListener(listener);
      await manager.dispatch({ update: { value: "test" } });
      expect(listener.calls.length).toBe(0);
    });

    it("is a no-op when the listener was never added", () => {
      const manager = new ListenerManager<"update", TestMessage>();
      const listener = fn();
      expect(() => manager.removeListener(listener)).not.toThrow();
    });
  });
});
