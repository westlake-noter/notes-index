import {repositoriesFromTree} from '../lib/github-repositories.mjs';

export default function remarkRepositoryContributors() {
  return (tree, file) => {
    const repositories = repositoriesFromTree(tree);
    file.data.frontMatter.githubRepositories = repositories;
  };
}
