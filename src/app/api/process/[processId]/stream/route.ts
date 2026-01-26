import { db } from "@/lib/db";
import { process as processTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const POLLING_INTERVAL = 2000;

function sendEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(
  request: Request,
  { params }: { params: { processId: string } },
) {
  const { processId } = params;
  let lastStatus: string | null = null;
  let isStreaming = true;
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      async function poll() {
        if (!isStreaming) {
          return;
        }

        try {
          // Fetch the current process status
          const processRecord = await db.query.process.findFirst({
            where: eq(processTable.id, processId),
            columns: {
              status: true,
              errorMessage: true,
              updatedAt: true,
            },
          });

          if (processRecord) {
            if (processRecord.status !== lastStatus) {
              const eventData = {
                status: processRecord.status,
                errorMessage: processRecord.errorMessage,
                updatedAt: processRecord.updatedAt,
              };

              controller.enqueue(encoder.encode(sendEvent(eventData)));
              lastStatus = processRecord.status;

              // If the process is complete or in error, stop streaming
              if (
                processRecord.status === "processed" ||
                processRecord.status === "accepted" ||
                processRecord.status === "error"
              ) {
                controller.close();
                isStreaming = false;
              }
            }
          } else {
            // If process is not found, close the stream gracefully
            controller.enqueue(
              encoder.encode(
                sendEvent({
                  status: "error",
                  errorMessage: "Process not found",
                }),
              ),
            );

            controller.close();
            isStreaming = false;
          }
        } catch (error) {
          console.error("SSE Polling Error:", error);
          controller.enqueue(
            encoder.encode(
              sendEvent({
                status: "error",
                errorMessage: "Internal server error during polling",
              }),
            ),
          );
          controller.close();
          isStreaming = false;
        }

        if (isStreaming) {
          setTimeout(poll, POLLING_INTERVAL);
        }
      }

      // Start the polling loop immediately
      poll();

      // Setup cleanup for when the client disconnects
      request.signal.addEventListener("abort", () => {
        isStreaming = false;
        controller.close();
        // console.log(`SSE stream aborted for process ${processId}`); // Avoid logging in production
      });
    },
    cancel() {
      isStreaming = false;
      // console.log(`SSE stream cancelled for process ${processId}`); // Avoid logging in production
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
