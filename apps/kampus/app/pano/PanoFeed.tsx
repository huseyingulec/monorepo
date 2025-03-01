import { Suspense } from "react";
import Link from "next/link";
import { Button, Flex } from "@radix-ui/themes";
import { graphql, useFragment, usePaginationFragment } from "react-relay";

import { PostItem } from "~/app/pano/features/post-list/PostItem";
import { type PanoFeed_viewer$key } from "./__generated__/PanoFeed_viewer.graphql";
import { type PanoFeedFragment$key } from "./__generated__/PanoFeedFragment.graphql";

const fragment = graphql`
  fragment PanoFeedFragment on Viewer
  @argumentDefinitions(
    after: { type: "String" }
    first: { type: "Int", defaultValue: 20 }
    before: { type: "String" }
    last: { type: "Int" }
    filter: { type: "PanoPostFilter" }
  )
  @refetchable(queryName: "PanoFeedPaginationQuery") {
    panoFeed(first: $first, after: $after, last: $last, before: $before, filter: $filter)
      @connection(key: "PanoFeedFragment__panoFeed") {
      __id
      edges {
        cursor
        node {
          id
          ...PostItem_post
        }
      }
    }
  }
`;

const viewerFragment = graphql`
  fragment PanoFeed_viewer on Viewer {
    ...PostItem_viewer
  }
`;

interface Props {
  panoFeed: PanoFeedFragment$key;
  panoViewer: PanoFeed_viewer$key;
}

export function PanoFeed(props: Props) {
  const { data, hasNext, hasPrevious, loadNext, loadPrevious } = usePaginationFragment(
    fragment,
    props.panoFeed
  );
  const viewer = useFragment(viewerFragment, props.panoViewer);

  const feed = data.panoFeed;

  return (
    <Suspense fallback="loading">
      <section className="flex flex-col gap-4">
        {feed?.edges?.map((edge) => {
          if (!edge?.node) {
            return null;
          }

          return (
            <PostItem
              key={edge.node.id}
              post={edge.node}
              viewerRef={viewer}
              postConnectionId={data.panoFeed?.__id}
            />
          );
        })}

        <Flex gap="2">
          <Button variant="soft" onClick={() => loadPrevious(20)} disabled={!hasPrevious}>
            {"< önceki sayfa"}
          </Button>
          <Button variant="soft" onClick={() => loadNext(20)} disabled={!hasNext}>
            {"sonraki sayfa >"}
          </Button>
        </Flex>
      </section>
    </Suspense>
  );
}
